#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import cac from 'cac';
import { logger, enableDebugMode, resolveCwd } from './utils/index.js';
import { configLoader, pluginSystem, templateEngine, hotReload } from './core/index.js';
import {
  createApp,
  addPage,
  addComponent,
  addStore,
  syncTemplate,
  validate,
  preview,
  generateCompletion,
} from './commands/index.js';
import type { PluginContext } from './core/index.js';

// Set up CLI root for path resolution
// cliEntryPath is /path/to/packages/cli/dist/index.js
// We need to get /path/to/packages/cli
const cliEntryPath = fileURLToPath(import.meta.url);
const cliRoot = path.dirname(path.dirname(cliEntryPath));
(global as { __cliRoot?: string }).__cliRoot = cliRoot;

const cli = cac('fsdk');

cli
  .version('0.1.0')
  .option('-h, --help', 'Show help')
  .option('--debug', 'Enable debug mode', { default: false })
  .option('--cwd <path>', 'Set working directory', { default: process.cwd() });

function createContext(cwd: string): PluginContext {
  return configLoader.createPluginContext(cwd, '', '');
}

cli
  .command('create [project-name]', 'Create a new application')
  .option('--template <name>', 'Template name (base|full)')
  .option('--package-manager <pm>', 'Package manager (npm|pnpm|yarn|bun)', { default: 'pnpm' })
  .option('--eslint', 'Enable ESLint', { default: true })
  .option('--no-git', 'Skip git initialization', { default: false })
  .option('--no-install', 'Skip dependency installation', { default: false })
  .action(async (projectName?: string, options?: Record<string, unknown>) => {
    enableDebugMode(options?.debug as boolean);

    const cwd = resolveCwd(options?.cwd as string);
    logger.info('Creating new application...');

    const context = createContext(cwd);
    await pluginSystem.execHook('beforeExec', context, 'create');

    try {
      await createApp(cwd, {
        projectName,
        template: options?.template as string,
        packageManager: options?.packageManager as 'npm' | 'pnpm' | 'yarn' | 'bun',
        eslint: options?.eslint as boolean,
        git: !(options?.git === false),
        install: !(options?.install === false),
      });

      await pluginSystem.execHook('afterExec', context, 'create', { success: true });
    } catch (error) {
      await pluginSystem.execHook('afterExec', context, 'create', { success: false, error });
      throw error;
    }
  });

cli
  .command('add-page', 'Add a new page')
  .option('--router-path <path>', 'Router path')
  .option('--page-name <name>', 'Page name')
  .action(async (options?: Record<string, unknown>) => {
    enableDebugMode(options?.debug as boolean);

    const cwd = resolveCwd(options?.cwd as string);
    logger.info('Adding new page...');

    const context = createContext(cwd);
    await pluginSystem.execHook('beforeExec', context, 'add-page');

    try {
      await addPage(cwd, {
        routerPath: options?.['router-path'] as string,
        pageName: options?.['page-name'] as string,
      });

      await pluginSystem.execHook('afterExec', context, 'add-page', { success: true });
    } catch (error) {
      await pluginSystem.execHook('afterExec', context, 'add-page', { success: false, error });
      throw error;
    }
  });

cli
  .command('add-component', 'Add a new component')
  .option('--type <type>', 'Component type (page|common|business)', { default: 'common' })
  .option('--name <name>', 'Component name')
  .option('--dir <dir>', 'Subdirectory')
  .action(async (options?: Record<string, unknown>) => {
    enableDebugMode(options?.debug as boolean);

    const cwd = resolveCwd(options?.cwd as string);
    logger.info('Adding new component...');

    const context = createContext(cwd);
    await pluginSystem.execHook('beforeExec', context, 'add-component');

    try {
      await addComponent(cwd, {
        type: options?.type as 'page' | 'common' | 'business',
        name: options?.name as string,
        dir: options?.dir as string,
      });

      await pluginSystem.execHook('afterExec', context, 'add-component', { success: true });
    } catch (error) {
      await pluginSystem.execHook('afterExec', context, 'add-component', { success: false, error });
      throw error;
    }
  });

cli
  .command('add-store', 'Add a new store')
  .option('--type <type>', 'Store type (pinia|redux)', { default: 'pinia' })
  .option('--name <name>', 'Store name')
  .action(async (options?: Record<string, unknown>) => {
    enableDebugMode(options?.debug as boolean);

    const cwd = resolveCwd(options?.cwd as string);
    logger.info('Adding new store...');

    const context = createContext(cwd);
    await pluginSystem.execHook('beforeExec', context, 'add-store');

    try {
      await addStore(cwd, {
        type: options?.type as 'pinia' | 'redux',
        name: options?.name as string,
      });

      await pluginSystem.execHook('afterExec', context, 'add-store', { success: true });
    } catch (error) {
      await pluginSystem.execHook('afterExec', context, 'add-store', { success: false, error });
      throw error;
    }
  });

cli
  .command('sync-template', 'Sync template files')
  .option('--template <name>', 'Template name')
  .option('--force', 'Force sync without confirmation')
  .action(async (options?: Record<string, unknown>) => {
    enableDebugMode(options?.debug as boolean);

    const cwd = resolveCwd(options?.cwd as string);
    logger.info('Syncing template...');

    await syncTemplate(cwd, {
      template: options?.template as string,
      force: options?.force as boolean,
    });
  });

cli
  .command('validate', 'Validate configuration and templates')
  .option('--config', 'Validate config only')
  .option('--templates', 'Validate templates only')
  .option('--strict', 'Strict validation')
  .action(async (options?: Record<string, unknown>) => {
    enableDebugMode(options?.debug as boolean);

    const cwd = resolveCwd(options?.cwd as string);

    await validate(cwd, {
      config: options?.config as boolean,
      templates: options?.templates as boolean,
      strict: options?.strict as boolean,
    });
  });

cli
  .command('preview', 'Preview template')
  .option('--port <port>', 'Port number', { default: 3000 })
  .option('--host <host>', 'Host address', { default: 'localhost' })
  .option('--open', 'Open browser')
  .option('--template <name>', 'Template name')
  .action(async (options?: Record<string, unknown>) => {
    enableDebugMode(options?.debug as boolean);

    const cwd = resolveCwd(options?.cwd as string);

    await preview(cwd, {
      port: options?.port as number,
      host: options?.host as string,
      open: options?.open as boolean,
      template: options?.template as string,
    });
  });

cli
  .command('completion [shell]', 'Generate shell completion script')
  .option('--output <path>', 'Output path')
  .action(async (shell?: string, options?: Record<string, unknown>) => {
    await generateCompletion({
      shell: shell as 'bash' | 'zsh' | 'fish' | undefined,
      output: options?.output as string,
    });
  });

async function main() {
  try {
    const context = createContext(process.cwd());

    await pluginSystem.execHook('beforeRegister', context);

    await pluginSystem.loadBuiltInPlugins(context);

    await pluginSystem.execHook('afterRegister', context);

    const parsed = cli.parse();

    // Handle help flag manually
    if (cli.rawArgs.includes('--help') || cli.rawArgs.includes('-h')) {
      console.log(`
Usage:
  $ fsdk <command> [options]

Commands:
  create [project-name]    Create a new application
  add-page                      Add a new page
  add-component                 Add a new component
  add-store                     Add a new store
  sync-template                 Sync template files
  validate                      Validate configuration and templates
  preview                       Preview template
  completion [shell]           Generate shell completion script

Options:
  -h, --help                    Show help
  -v, --version                 Show version
  --debug                       Enable debug mode
      `);
      process.exit(0);
    }
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
