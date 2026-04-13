import fs from 'fs-extra';
import path from 'path';
import fg from 'fast-glob';
import { logger } from '../utils/index.js';
import { templateEngine } from '../core/index.js';

export interface SyncTemplateOptions {
  template?: string;
  force?: boolean;
}

export async function syncTemplate(cwd: string, options: SyncTemplateOptions = {}): Promise<void> {
  try {
    const template = options.template || 'base';

    logger.info(`Syncing template ${template}...`);

    const templatePath = path.resolve(cwd, '.fsdk', 'template');
    const currentTemplatePath = path.resolve(templatePath, template);

    if (!fs.existsSync(currentTemplatePath)) {
      logger.warning(`Template ${template} not found in .fsdk/template`);
      logger.info('Run "fsdk create-app" first to initialize a template');
      return;
    }

    const srcDir = path.resolve(cwd, 'src');
    if (!fs.existsSync(srcDir)) {
      logger.error('src directory does not exist. Run "fsdk create-app" first.');
      return;
    }

    const { modifiedFiles, addedFiles, removedFiles } = await compareTemplates(
      currentTemplatePath,
      srcDir
    );

    if (modifiedFiles.length === 0 && addedFiles.length === 0 && removedFiles.length === 0) {
      logger.success('Template is already up to date');
      return;
    }

    if (options.force) {
      await applyTemplateSync(currentTemplatePath, srcDir, { modifiedFiles, addedFiles, removedFiles });
    } else {
      await interactiveSync(currentTemplatePath, srcDir, { modifiedFiles, addedFiles, removedFiles });
    }

    templateEngine.clearCache();
    logger.success('Template sync completed');
  } catch (error) {
    logger.error('Failed to sync template:', error);
    throw error;
  }
}

async function compareTemplates(
  templateDir: string,
  srcDir: string
): Promise<{
  modifiedFiles: string[];
  addedFiles: string[];
  removedFiles: string[];
}> {
  const templateFiles = await fg.glob('**/*', { cwd: templateDir, dot: true, onlyFiles: true });
  const srcFiles = await fg.glob('**/*', { cwd: srcDir, dot: true, onlyFiles: true });

  const templateSet = new Set(templateFiles);
  const srcSet = new Set(srcFiles);

  const modifiedFiles: string[] = [];
  const addedFiles: string[] = [];
  const removedFiles: string[] = [];

  for (const file of srcFiles) {
    if (templateSet.has(file)) {
      const templateContent = await fs.readFile(path.resolve(templateDir, file), 'utf-8');
      const srcContent = await fs.readFile(path.resolve(srcDir, file), 'utf-8');
      if (templateContent !== srcContent) {
        modifiedFiles.push(file);
      }
    } else {
      addedFiles.push(file);
    }
  }

  for (const file of templateFiles) {
    if (!srcSet.has(file)) {
      removedFiles.push(file);
    }
  }

  return { modifiedFiles, addedFiles, removedFiles };
}

async function applyTemplateSync(
  templateDir: string,
  srcDir: string,
  changes: { modifiedFiles: string[]; addedFiles: string[]; removedFiles: string[] }
): Promise<void> {
  const { modifiedFiles, addedFiles, removedFiles } = changes;

  for (const file of removedFiles) {
    const filePath = path.resolve(srcDir, file);
    await fs.remove(filePath);
    logger.debug(`Removed: ${file}`);
  }

  for (const file of [...modifiedFiles, ...addedFiles]) {
    await fs.copy(path.resolve(templateDir, file), path.resolve(srcDir, file));
    logger.debug(`Copied: ${file}`);
  }

  logger.info(`Synced: ${modifiedFiles.length} modified, ${addedFiles.length} added, ${removedFiles.length} removed`);
}

async function interactiveSync(
  templateDir: string,
  srcDir: string,
  changes: { modifiedFiles: string[]; addedFiles: string[]; removedFiles: string[] }
): Promise<void> {
  const { modifiedFiles, addedFiles, removedFiles } = changes;

  logger.info('Changes detected:');
  if (modifiedFiles.length > 0) {
    logger.info(`  Modified: ${modifiedFiles.length} files`);
  }
  if (addedFiles.length > 0) {
    logger.info(`  Added: ${addedFiles.length} files`);
  }
  if (removedFiles.length > 0) {
    logger.info(`  Removed: ${removedFiles.length} files`);
  }

  logger.warning('Use --force to apply all changes without confirmation');
}
