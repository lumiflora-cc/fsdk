import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/index.js';

export interface AddStoreOptions {
  name?: string;
  type?: 'pinia' | 'redux';
}

export async function addStore(cwd: string, options: AddStoreOptions = {}): Promise<void> {
  try {
    const resolvedOptions = await resolveOptions(options);
    const { name, type } = resolvedOptions;

    const storeDir = path.resolve(cwd, 'src', 'stores');
    await fs.ensureDir(storeDir);

    const storeTemplate = generateStoreTemplate(name, type);
    await fs.writeFile(path.resolve(storeDir, `${name}.ts`), storeTemplate.store);
    await fs.writeFile(path.resolve(storeDir, `${name}.test.ts`), storeTemplate.test);

    logger.success(`Store ${name} created at src/stores/`);
  } catch (error) {
    logger.error('Failed to add store:', error);
    throw error;
  }
}

async function resolveOptions(options: AddStoreOptions): Promise<Required<AddStoreOptions>> {
  if (options.name && options.type) {
    return {
      name: options.name,
      type: options.type,
    };
  }

  const responses = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'What is the store name?',
      initial: 'user',
      validate: (value) => /^[a-z][a-z0-9]*$/.test(value) || 'Start with lowercase letter',
    },
    {
      type: 'select',
      name: 'type',
      message: 'Select store type',
      choices: [
        { title: 'Pinia', value: 'pinia', description: 'Vue 3 state management' },
        { title: 'Redux', value: 'redux', description: 'Predictable state container' },
      ],
      initial: 0,
    },
  ]);

  return {
    name: options.name || responses.name,
    type: options.type || responses.type,
  };
}

function generateStoreTemplate(name: string, type: string): { store: string; test: string } {
  if (type === 'pinia') {
    return generatePiniaTemplate(name);
  }
  return generateReduxTemplate(name);
}

function generatePiniaTemplate(name: string): { store: string; test: string } {
  const store = `import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const use${toPascalCase(name)}Store = defineStore('${name}', () => {
  // State
  const data = ref<unknown>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const hasData = computed(() => data.value !== null);

  // Actions
  async function fetchData() {
    loading.value = true;
    error.value = null;
    try {
      // TODO: Implement data fetching
      data.value = null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function setData(newData: unknown) {
    data.value = newData;
  }

  function reset() {
    data.value = null;
    error.value = null;
  }

  return {
    data,
    loading,
    error,
    hasData,
    fetchData,
    setData,
    reset,
  };
});
`;

  const test = `import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { use${toPascalCase(name)}Store } from './${name}';

describe('${name} store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with default values', () => {
    const store = use${toPascalCase(name)}Store();
    expect(store.data).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('should set data', () => {
    const store = use${toPascalCase(name)}Store();
    store.setData({ test: 'value' });
    expect(store.data).toEqual({ test: 'value' });
  });

  it('should reset state', () => {
    const store = use${toPascalCase(name)}Store();
    store.setData({ test: 'value' });
    store.reset();
    expect(store.data).toBeNull();
  });
});
`;

  return { store, test };
}

function generateReduxTemplate(name: string): { store: string; test: string } {
  const store = `import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ${toPascalCase(name)}State {
  data: unknown;
  loading: boolean;
  error: string | null;
}

const initialState: ${toPascalCase(name)}State = {
  data: null,
  loading: false,
  error: null,
};

const ${name}Slice = createSlice({
  name: '${name}',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<unknown>) => {
      state.data = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    reset: () => initialState,
  },
});

export const { setData, setLoading, setError, reset } = ${name}Slice.actions;
export default ${name}Slice.reducer;

export const ${name}Store = configureStore({
  reducer: {
    ${name}: ${name}Slice.reducer,
  },
});

export type RootState = ReturnType<typeof ${name}Store.getState>;
export type AppDispatch = typeof ${name}Store.dispatch;
`;

  const test = `import { describe, it, expect } from 'vitest';
import { ${name}Slice } from './${name}';

describe('${name} slice', () => {
  it('should return the initial state', () => {
    expect(${name}Slice.reducer(undefined, { type: 'unknown' })).toEqual({
      data: null,
      loading: false,
      error: null,
    });
  });

  it('should handle setData', () => {
    const actual = ${name}Slice.reducer(undefined, ${name}Slice.actions.setData({ test: 'value' }));
    expect(actual.data).toEqual({ test: 'value' });
  });
});
`;

  return { store, test };
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
