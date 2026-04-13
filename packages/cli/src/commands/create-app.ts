import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/index.js';
import { templateEngine } from '../core/index.js';
import { spawn } from 'child_process';
import ora from 'ora';

export interface CreateAppOptions {
  template?: string;
  packageManager?: 'npm' | 'pnpm' | 'yarn' | 'bun';
  eslint?: boolean;
  git?: boolean;
  install?: boolean;
  projectName?: string;
}

export async function createApp(cwd: string, options: CreateAppOptions = {}): Promise<void> {
  const spinner = ora('Initializing project...').start();

  try {
    const resolvedOptions = await resolveOptions(options, cwd);
    const { projectName, template, packageManager, eslint, git, install } = resolvedOptions;
    const projectPath = path.resolve(cwd, projectName);

    if (fs.existsSync(projectPath)) {
      spinner.fail(`Directory ${projectName} already exists`);
      throw new Error(`Directory ${projectName} already exists`);
    }

    spinner.text = 'Creating project structure...';
    await fs.ensureDir(projectPath);

    spinner.text = 'Rendering template files...';
    await templateEngine.renderDirectory({
      templateName: template,
      outputDir: projectPath,
      data: {
        projectName,
        packageManager,
        eslint,
        git,
      },
      excludes: ['**/node_modules/**'],
    });

    await templateEngine.copyPublicFiles(template, projectPath);

    spinner.text = 'Initializing package.json...';
    await initializePackageJson(projectPath, projectName, packageManager);

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
        { title: 'Base', value: 'base', description: 'Basic template with minimal setup' },
        { title: 'Full', value: 'full', description: 'Full-featured template with all components' },
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

async function initializePackageJson(
  projectPath: string,
  projectName: string,
  packageManager: string
): Promise<void> {
  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'fsdk dev',
      build: 'fsdk build',
      preview: 'fsdk preview',
    },
    dependencies: {},
    devDependencies: {},
  };

  await fs.writeJson(path.resolve(projectPath, 'package.json'), packageJson, { spaces: 2 });
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
