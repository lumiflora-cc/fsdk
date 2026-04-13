import fs from 'fs-extra';
import path from 'path';
import { z } from 'zod';
import fg from 'fast-glob';
import { logger } from '../utils/index.js';
import { FsdkConfigSchema } from '../core/index.js';

export interface ValidateOptions {
  config?: boolean;
  templates?: boolean;
  strict?: boolean;
}

export async function validate(cwd: string, options: ValidateOptions = {}): Promise<void> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    if (options.config || (!options.config && !options.templates)) {
      await validateConfig(cwd, errors, warnings);
    }

    if (options.templates || (!options.config && !options.templates)) {
      await validateTemplates(cwd, errors, warnings);
    }

    if (errors.length > 0) {
      logger.error('Validation failed with errors:');
      errors.forEach((e) => logger.error(`  - ${e}`));
      process.exit(1);
    }

    if (warnings.length > 0) {
      logger.warning('Validation passed with warnings:');
      warnings.forEach((w) => logger.warning(`  - ${w}`));
    } else {
      logger.success('All validations passed!');
    }
  } catch (error) {
    logger.error('Validation error:', error);
    throw error;
  }
}

async function validateConfig(cwd: string, errors: string[], warnings: string[]): Promise<void> {
  logger.info('Validating configuration...');

  const configFiles = [
    '.fsdkrc.ts',
    '.fsdkrc.js',
    '.fsdkrc.json',
    '.fsdkrc',
    'fsdk.config.ts',
    'fsdk.config.js',
    'fsdk.config.json',
  ];

  const foundConfig = configFiles.find((f) => fs.existsSync(path.resolve(cwd, f)));

  if (!foundConfig) {
    warnings.push('No .fsdkrc configuration file found, using defaults');
    return;
  }

  try {
    const configPath = path.resolve(cwd, foundConfig);
    const ext = path.extname(foundConfig).toLowerCase();

    let config: unknown;

    if (ext === '.ts' || ext === '.js') {
      const module = await import(configPath);
      config = module.default || module;
    } else {
      const content = await fs.readFile(configPath, 'utf-8');
      config = JSON.parse(content);
    }

    const result = FsdkConfigSchema.safeParse(config);

    if (!result.success) {
      result.error.errors.forEach((e) => {
        errors.push(`Config validation failed: ${e.path.join('.')} - ${e.message}`);
      });
    } else {
      logger.success(`Config file ${foundConfig} is valid`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((e) => {
        errors.push(`Config validation failed: ${e.path.join('.')} - ${e.message}`);
      });
    } else {
      errors.push(`Failed to parse config file: ${error}`);
    }
  }
}

async function validateTemplates(cwd: string, errors: string[], warnings: string[]): Promise<void> {
  logger.info('Validating templates...');

  const templateDir = path.resolve(cwd, '.fsdk', 'template');
  if (!fs.existsSync(templateDir)) {
    warnings.push('No template directory found');
    return;
  }

  const templateFiles = await fg.glob('**/*', { cwd: templateDir, dot: true, onlyFiles: true });

  if (templateFiles.length === 0) {
    warnings.push('Template directory is empty');
    return;
  }

  const vueFiles = templateFiles.filter((f) => String(f).endsWith('.vue'));
  const tsFiles = templateFiles.filter((f) => String(f).endsWith('.ts'));
  const lessFiles = templateFiles.filter((f) => String(f).endsWith('.less'));

  logger.debug(`Found ${vueFiles.length} Vue files, ${tsFiles.length} TS files, ${lessFiles.length} Less files`);

  let valid = true;
  for (const vueFile of vueFiles) {
    const content = await fs.readFile(path.resolve(templateDir, vueFile as string), 'utf-8');
    if (!validateVueFile(content)) {
      errors.push(`Invalid Vue file: ${vueFile}`);
      valid = false;
    }
  }

  for (const tsFile of tsFiles) {
    const content = await fs.readFile(path.resolve(templateDir, tsFile as string), 'utf-8');
    if (!validateTsFile(content)) {
      errors.push(`Invalid TypeScript file: ${tsFile}`);
      valid = false;
    }
  }

  if (valid) {
    logger.success(`Template validation passed (${templateFiles.length} files)`);
  }
}

function validateVueFile(content: string): boolean {
  const hasTemplate = content.includes('<template>');
  const hasScript = content.includes('<script');
  return hasTemplate || hasScript;
}

function validateTsFile(content: string): boolean {
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      continue;
    }
    if (trimmed.includes(':') && !trimmed.match(/^\s*\/\//)) {
      return true;
    }
  }
  return content.includes('export') || content.includes('import');
}
