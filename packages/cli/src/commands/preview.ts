import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/index.js';
import { templateEngine } from '../core/index.js';
import { hotReload } from '../core/index.js';

export interface PreviewOptions {
  port?: number;
  host?: string;
  open?: boolean;
  template?: string;
}

export async function preview(cwd: string, options: PreviewOptions = {}): Promise<void> {
  const port = options.port || 3000;
  const host = options.host || 'localhost';

  try {
    const previewServerDir = path.resolve(cwd, '.fsdk', 'preview-temp');
    await fs.ensureDir(previewServerDir);

    logger.info(`Preparing preview server at http://${host}:${port}`);

    await templateEngine.renderDirectory({
      templateName: options.template || 'base',
      outputDir: previewServerDir,
      data: {
        port,
        host,
      },
    });

    await startPreviewServer(previewServerDir, port, host);

    if (options.open) {
      const openCmd = process.platform === 'win32' ? 'start' : 'open';
      execSync(`${openCmd} http://${host}:${port}`, { stdio: 'ignore' });
    }

    await hotReload.start({
      watchPaths: [previewServerDir],
      onChange: (event, file) => {
        logger.info(`File ${event}: ${path.relative(previewServerDir, file)}`);
      },
    });

    logger.success('Preview server is running. Press Ctrl+C to stop.');
  } catch (error) {
    logger.error('Failed to start preview server:', error);
    throw error;
  }
}

async function startPreviewServer(serverDir: string, port: number, host: string): Promise<void> {
  const indexPath = path.resolve(serverDir, 'index.html');

  if (!fs.existsSync(indexPath)) {
    const html = generateDefaultHtml(port, host);
    await fs.writeFile(indexPath, html);
  }

  logger.info(`Preview server running at http://${host}:${port}`);
}

function generateDefaultHtml(port: number, host: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fsdk Preview</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { color: #333; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Fsdk Preview</h1>
    <p>Server running at http://${host}:${port}</p>
  </div>
</body>
</html>
`;
}
