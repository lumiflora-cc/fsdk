import ejs from 'ejs';
import fg from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/index.js';
import { resolveTemplatePath } from '../utils/path.js';

export interface TemplateEngineOptions {
  templateName: string;
  templateDir?: string;
  outputDir: string;
  data?: Record<string, unknown>;
  excludes?: string[];
}

export interface RenderFile {
  source: string;
  destination: string;
  isTemplate: boolean;
}

export class TemplateEngine {
  private cache: Map<string, string> = new Map();

  async renderFile(source: string, destination: string, data: Record<string, unknown> = {}): Promise<void> {
    const ext = path.extname(source).toLowerCase();
    const templateExtensions = ['.ejs', '.tpl', '.tmpl'];
    const isTemplate = templateExtensions.includes(ext) || source.includes('.ejs');

    try {
      if (isTemplate) {
        const content = await fs.readFile(source, 'utf-8');
        const rendered = await ejs.render(content, data, {
          rmWhitespace: true,
          debug: false,
        });
        await fs.ensureDir(path.dirname(destination));
        await fs.writeFile(destination.replace(/\.ejs$/, ''), rendered, 'utf-8');
        logger.debug(`Rendered template: ${source} -> ${destination}`);
      } else {
        await fs.copy(source, destination, { overwrite: true });
        logger.debug(`Copied file: ${source} -> ${destination}`);
      }
    } catch (error) {
      logger.error(`Failed to render file ${source}:`, error);
      throw error;
    }
  }

  async renderDirectory(options: TemplateEngineOptions): Promise<void> {
    const {
      templateName,
      templateDir = 'src',
      outputDir,
      data = {},
      excludes = [],
    } = options;

    const templatePath = resolveTemplatePath(templateName, templateDir);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template path does not exist: ${templatePath}`);
    }

    const pattern = ['**/*', ...excludes.map((e) => `!${e}`)];
    const files = await fg.glob(pattern, { cwd: templatePath, dot: true });

    logger.debug(`Found ${files.length} files to render in ${templatePath}`);

    const renderPromises = files.map(async (file: string) => {
      const source = path.resolve(templatePath, file);
      const destination = path.resolve(outputDir, file);
      await this.renderFile(source, destination, data);
    });

    await Promise.all(renderPromises);
    logger.success(`Template rendered to ${outputDir}`);
  }

  async copyPublicFiles(templateName: string, outputDir: string): Promise<void> {
    const publicPath = resolveTemplatePath(templateName, 'public');
    if (!fs.existsSync(publicPath)) {
      logger.debug(`No public directory found in template ${templateName}`);
      return;
    }

    const publicOutput = path.resolve(outputDir, 'public');
    await fs.copy(publicPath, publicOutput, { overwrite: true });
    logger.debug(`Copied public files to ${publicOutput}`);
  }

  clearCache(): void {
    this.cache.clear();
    logger.debug('Template cache cleared');
  }

  async previewTemplate(templateName: string, data: Record<string, unknown> = {}): Promise<string[]> {
    const templatePath = resolveTemplatePath(templateName, 'src');
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template path does not exist: ${templatePath}`);
    }

    const pattern = ['**/*'];
    const files = await fg.glob(pattern, { cwd: templatePath, dot: true });

    const preview: string[] = [];
    for (const file of files) {
      const source = path.resolve(templatePath, file as string);
      const ext = path.extname(source).toLowerCase();
      const isTemplate = ['.ejs', '.tpl', '.tmpl'].includes(ext);

      if (isTemplate) {
        const content = await fs.readFile(source, 'utf-8');
        const rendered = ejs.render(content, data, { rmWhitespace: true, debug: false });
        preview.push(`--- ${file} ---\n${rendered}`);
      } else {
        preview.push(`--- ${file} (binary)`);
      }
    }

    return preview;
  }
}

export const templateEngine = new TemplateEngine();
