import { defineConfig } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Merge all rules from flat config arrays (eslint-plugin-vue@9 uses flat config format)
function mergeVueRules(...configs) {
  const rules = {}
  for (const cfg of configs) {
    if (Array.isArray(cfg)) {
      for (const c of cfg) {
        if (c.rules) Object.assign(rules, c.rules)
      }
    } else if (cfg.rules) {
      Object.assign(rules, cfg.rules)
    }
  }
  return rules
}

const vueRecommendedRules = mergeVueRules(pluginVue.configs['flat/recommended'])
const vueStronglyRecommendedRules = mergeVueRules(pluginVue.configs['flat/strongly-recommended'])

export default defineConfig([
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      vue: pluginVue,
      '@typescript-eslint': tseslint
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },
    rules: {
      // TypeScript strict rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // General strict rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-return-await': 'error',
      'no-sparse-arrays': 'error',
      'no-unreachable': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error'
    }
  },
  {
    files: ['**/*.vue'],
    plugins: {
      vue: pluginVue,
      '@typescript-eslint': tseslint
    },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },
    rules: {
      // Merge recommended + strongly-recommended rules (114 rules)
      ...vueRecommendedRules,
      ...vueStronglyRecommendedRules,
      // Override: wordy component names off (pages use short names)
      'vue/multi-word-component-names': 'off',
      // Disable comment-directive (emits spurious clear messages in flat config)
      'vue/comment-directive': 'off',
      // Additional Vue 3 specific strict rules
      'vue/require-default-prop': 'error',
      'vue/require-explicit-emits': 'error',
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/component-tags-order': ['error', {
        order: [['script', 'template'], 'styles', 'custom-blocks']
      }],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/define-emits-declaration': 'error',
      'vue/define-macros-order': ['error', {
        order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots', '//']
      }],
      'vue/html-self-closing': ['error', {
        html: { void: 'always', normal: 'never', component: 'always' },
        svg: 'always',
        math: 'always'
      }],
      'vue/no-boolean-default': ['error', 'default-false'],
      'vue/no-empty-component-block': 'error',
      'vue/no-multiple-objects-in-class': 'error',
      'vue/no-potential-component-option-typo': ['error', {
        presets: ['vue', 'vue-router']
      }],
      'vue/no-template-target-blank': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/no-v-text': 'error',
      'vue/padding-line-between-blocks': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/require-macro-variable-name': ['error', {
        defineProps: 'props',
        defineEmits: 'emit',
        defineSlots: 'slots'
      }],
      'vue/v-for-delimiter-style': ['error', 'in'],
      'vue/v-on-function-call': 'error',
      'vue/valid-define-options': 'error'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', '**/dist/**', '*.d.ts']
  }
])
