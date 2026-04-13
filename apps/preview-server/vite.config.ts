import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [vue()],
  root: join(__dirname, 'preview'),
  server: {
    port: parseInt(process.argv.find(arg => arg.startsWith('--port='))?.split('=')[1] || '3000'),
    strictPort: true
  },
  preview: {
    port: parseInt(process.argv.find(arg => arg.startsWith('--port='))?.split('=')[1] || '3000'),
    strictPort: true
  },
  resolve: {
    alias: {
      '@': join(__dirname, 'preview'),
      '@templates': join(__dirname, '../../../packages/templates')
    }
  }
});
