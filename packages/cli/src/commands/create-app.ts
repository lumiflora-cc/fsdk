import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';
import { logger, Spinner, getTemplatesRoot } from '../utils/index.js';
import { templateEngine } from '../core/index.js';
import { spawn } from 'child_process';

export interface CreateAppOptions {
  template?: string;
  packageManager?: 'npm' | 'pnpm' | 'yarn' | 'bun';
  eslint?: boolean;
  git?: boolean;
  install?: boolean;
  projectName?: string;
}

export async function createApp(cwd: string, options: CreateAppOptions = {}): Promise<void> {
  // Early check: if projectName is provided, verify directory doesn't exist
  // This avoids wasting user time with prompts if directory already exists
  if (options.projectName) {
    const projectPath = path.resolve(cwd, options.projectName);
    if (fs.existsSync(projectPath)) {
      throw new Error(`Directory ${options.projectName} already exists`);
    }
  }

  // First resolve options to determine if interactive mode
  const resolvedOptions = await resolveOptions(options, cwd);
  const { projectName, template, packageManager, eslint, git, install } = resolvedOptions;
  const projectPath = path.resolve(cwd, projectName);
  const isInteractive = !options.template;

  // Only show info log in non-interactive mode
  if (!isInteractive) {
    logger.info('Creating new application...');
  }

  // Only use spinner in non-interactive mode (when template is provided)
  const spinner = new Spinner(!isInteractive, 'Creating project...');

  try {
    if (fs.existsSync(projectPath)) {
      spinner.fail(`Directory ${projectName} already exists`);
      throw new Error(`Directory ${projectName} already exists`);
    }

    spinner.text = 'Creating project structure...';
    await fs.ensureDir(projectPath);

    // Copy root template files (package.json, tsconfig, vite.config, etc.)
    const rootTemplatePath = path.resolve(getTemplatesRoot(), template);
    const rootFiles = ['package.json', 'tsconfig.json', 'tsconfig.app.json', 'vite.config.ts', 'index.html', '.gitignore', 'eslint.config.mjs'];
    await Promise.all(
      rootFiles.map(async (file) => {
        const source = path.resolve(rootTemplatePath, file);
        const dest = path.resolve(projectPath, file);
        if (await fs.pathExists(source)) {
          await fs.copy(source, dest);
          // Update package.json name to project name
          if (file === 'package.json') {
            const pkg = await fs.readJson(dest);
            pkg.name = projectName;
            await fs.writeJson(dest, pkg, { spaces: 2 });
          }
        }
      })
    );

    // Render src template files
    spinner.text = 'Rendering template files...';
    await templateEngine.renderDirectory({
      templateName: template,
      templateDir: 'src',
      outputDir: path.resolve(projectPath, 'src'),
      data: {
        projectName,
        packageManager,
        eslint,
        git,
      },
      excludes: ['**/node_modules/**'],
    });

    await templateEngine.copyPublicFiles(template, projectPath);

    if (git) {
      spinner.text = 'Initializing git repository...';
      try {
        await spawnCommand('git', ['init'], projectPath);
      } catch {
        logger.warning('Failed to initialize git repository');
      }
    }

    if (install) {
      spinner.text = `Installing dependencies with ${packageManager}...`;
      await spawnCommand(packageManager, ['install'], projectPath);
    }

    spinner.succeed(`Project ${projectName} created successfully!`);
    logger.info(`cd ${projectName} to start developing`);
  } catch (error) {
    spinner.fail('Failed to create project');
    throw error;
  }
}

async function resolveOptions(options: CreateAppOptions, cwd: string): Promise<Required<CreateAppOptions>> {
  // If all required options are provided, use them directly (non-interactive mode)
  if (options.projectName && options.template) {
    return {
      projectName: options.projectName,
      template: options.template,
      packageManager: options.packageManager || 'pnpm',
      eslint: options.eslint ?? true,
      git: options.git ?? true,
      install: options.install ?? true,
    };
  }

  // Otherwise, enter interactive mode
  const responses = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'What is the project name?',
      initial: 'my-app',
      validate: (value) => /^[a-z0-9-]+$/.test(value) || 'Only lowercase letters, numbers, and hyphens are allowed',
    },
    {
      type: 'select',
      name: 'template',
      message: 'Select a template',
      choices: [
        { title: 'Base', value: 'base', description: 'Basic template with Vite' },
        { title: 'Full', value: 'full', description: 'Full-featured template with Vite + Element Plus + Pinia' },
      ],
      initial: 0,
    },
    {
      type: 'select',
      name: 'packageManager',
      message: 'Select a package manager',
      choices: [
        { title: 'pnpm', value: 'pnpm' },
        { title: 'npm', value: 'npm' },
        { title: 'yarn', value: 'yarn' },
        { title: 'bun', value: 'bun' },
      ],
      initial: 0,
    },
    {
      type: 'confirm',
      name: 'eslint',
      message: 'Enable ESLint?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'git',
      message: 'Initialize git repository?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'install',
      message: 'Install dependencies?',
      initial: true,
    },
  ]);

  return {
    projectName: options.projectName || responses.projectName,
    template: options.template || responses.template,
    packageManager: options.packageManager || responses.packageManager,
    eslint: options.eslint ?? responses.eslint,
    git: options.git ?? responses.git,
    install: options.install ?? responses.install,
  };
}

async function spawnCommand(cmd: string, args: string[], cwd: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command ${cmd} ${args.join(' ')} exited with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}
