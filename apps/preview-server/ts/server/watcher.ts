import chokidar, { FSWatcher } from 'chokidar';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// 从 apps/preview-server/ts/server/ 向上4层到项目根目录
const templatesPath = join(__dirname, '../../../../packages/templates');

let watcher: FSWatcher | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY = 100; // 100ms 以内的变化合并

/**
 * 监听模板目录变化
 * @param callback - 变化时的回调函数
 * @returns Promise<chokidar.FSWatcher>
 */
export async function watchTemplates(callback: (event: string, path: string) => void): Promise<FSWatcher> {
  if (watcher) {
    await watcher.close();
  }

  watcher = chokidar.watch(templatesPath, {
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 50,
      pollInterval: 50
    }
  });

  const notifyWithDebounce = (event: string, path: string): void => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      callback(event, path);
    }, DEBOUNCE_DELAY);
  };

  watcher
    .on('add', (path: string) => notifyWithDebounce('add', path))
    .on('change', (path: string) => notifyWithDebounce('change', path))
    .on('unlink', (path: string) => notifyWithDebounce('unlink', path))
    .on('error', (error: Error) => console.error('[Watcher Error]', error));

  console.log(`[Watcher] Started watching: ${templatesPath}`);

  return watcher;
}

/**
 * 停止监听
 */
export async function stopWatching(): Promise<void> {
  if (watcher) {
    await watcher.close();
    watcher = null;
    console.log('[Watcher] Stopped watching');
  }
}
