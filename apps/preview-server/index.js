#!/usr/bin/env node

import { startServer } from './server/index.js';

const port = parseInt(process.argv.find(arg => arg.startsWith('--port='))?.split('=')[1] || '3000');

async function main() {
  try {
    console.log('\n🚀 Starting Lumiflora FSDK Preview Server...\n');
    
    const { sseServer } = await startServer();
    
    sseServer.listen(port, '0.0.0.0', () => {
      console.log(`\n✨ Preview server is ready at http://localhost:${port}\n`);
    });

    // 优雅关闭
    process.on('SIGINT', () => {
      console.log('\n\n👋 Shutting down preview server...');
      sseServer.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start preview server:', error);
    process.exit(1);
  }
}

main();
