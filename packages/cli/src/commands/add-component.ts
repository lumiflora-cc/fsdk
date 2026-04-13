import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';
import { logger, toKebabCase } from '../utils/index.js';

export interface AddComponentOptions {
  type?: 'page' | 'common' | 'business';
  name?: string;
  dir?: string;
}

export async function addComponent(cwd: string, options: AddComponentOptions = {}): Promise<void> {
  try {
    const resolvedOptions = await resolveOptions(options);
    const { type, name, dir } = resolvedOptions;

    const componentDir = path.resolve(cwd, 'src', 'components', type, dir || '');
    await fs.ensureDir(componentDir);

    const componentTemplate = generateComponentTemplate(name, type);
    await Promise.all([
      fs.writeFile(path.resolve(componentDir, `${name}.vue`), componentTemplate.component),
      fs.writeFile(path.resolve(componentDir, `${name}.less`), componentTemplate.styles),
      fs.writeFile(path.resolve(componentDir, `index.ts`), componentTemplate.index),
    ]);

    logger.success(`Component ${name} created at src/components/${type}/${dir || name}/`);
  } catch (error) {
    logger.error('Failed to add component:', error);
    throw error;
  }
}

async function resolveOptions(options: AddComponentOptions): Promise<Required<AddComponentOptions>> {
  if (options.type && options.name) {
    return {
      type: options.type,
      name: options.name,
      dir: options.dir || '',
    };
  }

  const responses = await prompts([
    {
      type: 'select',
      name: 'type',
      message: 'Select component type',
      choices: [
        { title: 'Common', value: 'common', description: 'Shared components' },
        { title: 'Business', value: 'business', description: 'Business-specific components' },
        { title: 'Page', value: 'page', description: 'Page-specific components' },
      ],
      initial: 0,
    },
    {
      type: 'text',
      name: 'name',
      message: 'What is the component name?',
      initial: 'my-component',
      validate: (value) => /^[A-Z][a-zA-Z0-9]*$/.test(value) || 'Start with uppercase letter',
    },
    {
      type: 'text',
      name: 'dir',
      message: 'Subdirectory (optional):',
      initial: '',
    },
  ]);

  return {
    type: options.type || responses.type,
    name: options.name || responses.name,
    dir: options.dir || responses.dir || '',
  };
}

function generateComponentTemplate(name: string, type: string): { component: string; styles: string; index: string } {
  const component = `<template>
  <div class="${toKebabCase(name)}">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: '${name}',
  inheritAttrs: true,
});
</script>

<style scoped lang="less">
.${toKebabCase(name)} {
  display: block;
}
</style>
`;

  const styles = `// ${name} component styles
.${toKebabCase(name)} {
  // component styles
}
`;

  const index = `export { default as ${name} } from './${name}.vue';
export type { } from './${name}.vue';
`;

  return { component, styles, index };
}
