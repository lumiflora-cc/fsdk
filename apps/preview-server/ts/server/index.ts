import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../');

const port = parseInt(process.argv.find(arg => arg.startsWith('--port='))?.split('=')[1] || '3000');

interface SSEClient {
  write(message: string): void;
}

declare global {
   
  var sseClients: SSEClient[] | undefined;
}

/**
 * 创建 SSE 连接用于热重载
 */
function createSSEClient(req: http.IncomingMessage, res: http.ServerResponse): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // 发送初始连接成功消息
  res.write('data: {"type":"connected"}\n\n');

  // 存储 res 以便后续发送消息
  if (!global.sseClients) {
    global.sseClients = [];
  }
  global.sseClients.push(res);

  req.on('close', () => {
    global.sseClients = global.sseClients!.filter(client => client !== res);
  });
}

/**
 * 通知所有 SSE 客户端
 */
export function notifyClients(data: Record<string, unknown>): void {
  if (global.sseClients) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    global.sseClients.forEach(client => {
      try {
        client.write(message);
      } catch {
        // 忽略已关闭的连接
      }
    });
  }
}

/**
 * 创建预览服务器
 */
export function createServer(port: number): http.Server {
  const server = http.createServer((req, res) => {
    // SSE 端点
    if (req.url === '/sse') {
      return createSSEClient(req, res);
    }

    // API 端点 - 获取模板列表
    if (req.url === '/api/templates') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ templates: ['full', 'base'] }));
      return;
    }

    // 静态资源
    if (req.url?.startsWith('/preview/')) {
      const filePath = join(rootDir, req.url);
      // 返回静态文件
      import('fs').then(fs => {
        if (fs.existsSync(filePath)) {
          const ext = filePath.split('.').pop();
          const contentType: Record<string, string> = {
            'html': 'text/html',
            'js': 'application/javascript',
            'css': 'text/css',
            'vue': 'application/javascript'
          };
          res.writeHead(200, { 'Content-Type': contentType[ext || ''] || 'text/plain' });
          res.end(fs.readFileSync(filePath));
        } else {
          res.writeHead(404);
          res.end('Not found');
        }
      });
      return;
    }

    // 默认返回 preview/index.html
    const indexPath = join(rootDir, 'preview/index.html');
    import('fs').then(fs => {
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(indexPath));
      } else {
        res.writeHead(404);
        res.end('Preview page not found');
      }
    });
  });

  return server;
}

/**
 * 启动预览服务器
 */
export async function startServer(): Promise<{ sseServer: http.Server; watcher: unknown }> {
  const { createServer: createViteServer } = await import('vite');
  const { watchTemplates } = await import('./watcher.js');
  const { loadTemplates } = await import('./template-loader.js');

  // 加载模板
  await loadTemplates();

  // 启动 SSE 服务器
  const sseServer = createServer(port);

  // 启动模板监听
  const watcher = await watchTemplates((event: string, path: string) => {
    console.log(`[Watcher] ${event}: ${path}`);
    notifyClients({ type: 'reload', event, path, timestamp: Date.now() });
  });

  console.log(`\n  🔥 Preview Server running at:`);
  console.log(`  ➜  Local:   http://localhost:${port}`);
  console.log(`  ➜  Network: http://0.0.0.0:${port}\n`);
  console.log(`  Watching templates for changes...\n`);

  return { sseServer, watcher };
}
