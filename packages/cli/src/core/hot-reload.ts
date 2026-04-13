import chokidar from 'chokidar';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/index.js';

export interface HotReloadOptions {
  watchPaths: string[];
  ignored?: string[];
  persistent?: boolean;
  ignoreInitial?: boolean;
  onChange?: (event: 'add' | 'change' | 'unlink', filePath: string) => void;
  onReady?: () => void;
}

export class HotReload {
  private watcher: chokidar.FSWatcher | null = null;
  private watchPaths: string[] = [];
  private ignored: string[] = [];
  private cache: Map<string, string> = new Map();

  async start(options: HotReloadOptions): Promise<void> {
    const {
      watchPaths,
      ignored = ['**/node_modules/**', '**/.git/**', '**/dist/**'],
      persistent = true,
      ignoreInitial = true,
      onChange,
      onReady,
    } = options;

    this.watchPaths = watchPaths;
    this.ignored = ignored;

    if (this.watcher) {
      await this.stop();
    }

    this.watcher = chokidar.watch(watchPaths, {
      ignored,
      persistent,
      ignoreInitial,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 100,
      },
    });

    this.watcher
      .on('add', (filePath: string) => {
        logger.debug(`File added: ${filePath}`);
        this.clearFileCache(filePath);
        onChange?.('add', filePath);
      })
      .on('change', (filePath: string) => {
        logger.debug(`File changed: ${filePath}`);
        this.clearFileCache(filePath);
        onChange?.('change', filePath);
      })
      .on('unlink', (filePath: string) => {
        logger.debug(`File removed: ${filePath}`);
        this.clearFileCache(filePath);
        onChange?.('unlink', filePath);
      })
      .on('ready', () => {
        logger.info(`Hot reload watching ${watchPaths.length} paths`);
        onReady?.();
      })
      .on('error', (error: Error) => {
        logger.error('Hot reload error:', error);
      });
  }

  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      logger.debug('Hot reload stopped');
    }
  }

  clearFileCache(filePath: string): void {
    const normalizedPath = path.normalize(filePath);
    this.cache.delete(normalizedPath);
    logger.debug(`Cache cleared for ${normalizedPath}`);
  }

  clearAllCache(): void {
    this.cache.clear();
    logger.debug('All cache cleared');
  }

  isWatching(): boolean {
    return this.watcher !== null;
  }

  getWatchedPaths(): string[] {
    if (!this.watcher) return [];
    return Object.keys(this.watcher.getWatched());
  }
}

export const hotReload = new HotReload();
