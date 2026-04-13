import fs from 'fs-extra';
import path from 'path';
import { z } from 'zod';
import json5 from 'json5';
import { logger } from '../utils/index.js';
import { normalizePath } from '../utils/path.js';

export const FsdkConfigSchema = z.object({
  template: z.string().optional(),
  packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']).optional(),
  eslint: z.boolean().optional().default(true),
  git: z.boolean().optional().default(true),
  install: z.boolean().optional().default(true),
  router: z.object({
    type: z.enum(['hash', 'history']).optional().default('hash'),
    base: z.string().optional(),
  }).optional(),
  store: z.object({
    type: z.enum(['pinia', 'redux']).optional().default('pinia'),
  }).optional(),
  aliases: z.record(z.string()).optional(),
  transforms: z.array(z.object({
    name: z.string(),
    options: z.record(z.unknown()).optional(),
  })).optional(),
});

export type FsdkConfig = z.infer<typeof FsdkConfigSchema>;

export interface PluginContext {
  cwd: string;
  config: FsdkConfig;
  templatesDir: string;
  pluginsDir: string;
}

export class ConfigLoader {
  private configCache: Map<string, FsdkConfig> = new Map();

  async loadConfig(cwd: string = process.cwd()): Promise<FsdkConfig> {
    const cacheKey = normalizePath(cwd);
    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey)!;
    }

    const configPath = this.findConfigFile(cwd);
    if (!configPath) {
      logger.debug('No .fsdkrc.ts found, using defaults');
      return this.getDefaultConfig();
    }

    try {
      const config = await this.parseConfigFile(configPath);
      const validated = FsdkConfigSchema.parse(config);
      this.configCache.set(cacheKey, validated);
      logger.success(`Loaded config from ${path.basename(configPath)}`);
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('Config validation failed:', error.errors);
        throw new Error(`Config validation failed: ${error.errors.map((e) => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  private findConfigFile(cwd: string): string | null {
    const candidates = [
      '.fsdkrc.ts',
      '.fsdkrc.js',
      '.fsdkrc.json',
      '.fsdkrc',
      'fsdk.config.ts',
      'fsdk.config.js',
      'fsdk.config.json',
    ];

    for (const candidate of candidates) {
      const configPath = path.resolve(cwd, candidate);
      if (fs.existsSync(configPath)) {
        return configPath;
      }
    }

    return null;
  }

  private async parseConfigFile(configPath: string): Promise<unknown> {
    const ext = path.extname(configPath).toLowerCase();

    switch (ext) {
      case '.ts':
      case '.js': {
        const module = await import(configPath);
        return module.default || module;
      }
      case '.json':
      case '':
        return json5.parse(fs.readFileSync(configPath, 'utf-8'));
      default:
        throw new Error(`Unsupported config file format: ${ext}`);
    }
  }

  private getDefaultConfig(): FsdkConfig {
    return {
      template: 'base',
      packageManager: 'pnpm',
      eslint: true,
      git: true,
      install: true,
      router: { type: 'hash' },
      store: { type: 'pinia' },
    };
  }

  clearCache(cwd?: string): void {
    if (cwd) {
      this.configCache.delete(normalizePath(cwd));
    } else {
      this.configCache.clear();
    }
    logger.debug('Config cache cleared');
  }

  getDefault(): FsdkConfig {
    return this.getDefaultConfig();
  }

  createPluginContext(cwd: string, templatesDir: string, pluginsDir: string): PluginContext {
    return {
      cwd,
      config: this.getDefaultConfig(),
      templatesDir,
      pluginsDir,
    };
  }
}

export const configLoader = new ConfigLoader();
