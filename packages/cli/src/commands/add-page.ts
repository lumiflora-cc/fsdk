import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';
import { logger, toPascalCase, toKebabCase } from '../utils/index.js';
import fg from 'fast-glob';

export interface AddPageOptions {
  routerPath?: string;
  pageName?: string;
  type?: 'page' | 'component';
}

export async function addPage(cwd: string, options: AddPageOptions = {}): Promise<void> {
  try {
    const resolvedOptions = await resolveOptions(options);
    const { pageName, routerPath } = resolvedOptions;

    const pageDir = path.resolve(cwd, 'src', 'views', pageName);
    if (fs.existsSync(pageDir)) {
      logger.error(`Page directory ${pageName} already exists`);
      throw new Error(`Page directory ${pageName} already exists`);
    }

    await fs.ensureDir(pageDir);

    const pageTemplate = generatePageTemplate(pageName, routerPath);
    await fs.writeFile(path.resolve(pageDir, 'index.vue'), pageTemplate.page);
    await fs.writeFile(path.resolve(pageDir, 'index.less'), pageTemplate.styles);

    logger.success(`Page ${pageName} created at src/views/${pageName}/`);
    logger.info(`Router path: ${routerPath}`);
  } catch (error) {
    logger.error('Failed to add page:', error);
    throw error;
  }
}

async function resolveOptions(options: AddPageOptions): Promise<{ pageName: string; routerPath: string }> {
  if (options.pageName && options.routerPath) {
    return {
      pageName: options.pageName,
      routerPath: options.routerPath,
    };
  }

  const responses = await prompts([
    {
      type: 'text',
      name: 'pageName',
      message: 'What is the page name?',
      initial: 'about',
      validate: (value) => /^[a-z][a-z0-9-]*$/.test(value) || 'Start with lowercase letter, only lowercase letters, numbers, and hyphens',
    },
    {
      type: 'text',
      name: 'routerPath',
      message: 'Enter the router path:',
      initial: (prev: string) => `/${prev.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')}`,
    },
  ]);

  return {
    pageName: options.pageName || responses.pageName,
    routerPath: options.routerPath || responses.routerPath,
  };
}

function generatePageTemplate(pageName: string, routerPath: string): { page: string; styles: string } {
  const componentName = toPascalCase(pageName);

  const page = `<template>
  <div class="${pageName}-page">
    <h1>${componentName}</h1>
    <p>Router path: ${routerPath}</p>
  </div>
</template>

<script setup lang="ts">
// ${componentName} page component
</script>

<style scoped lang="less">
.${pageName}-page {
  padding: 20px;
}
</style>
`;

  const styles = `// ${componentName} page styles
.${pageName}-page {
  min-height: 100vh;
}
`;

  return { page, styles };
}

export async function syncPageRoutes(cwd: string): Promise<void> {
  const viewsDir = path.resolve(cwd, 'src', 'views');
  if (!fs.existsSync(viewsDir)) {
    logger.warning('Views directory does not exist');
    return;
  }

  const pageDirs = await fg.glob('*', { cwd: viewsDir, onlyDirectories: true });
  logger.success(`Found ${pageDirs.length} pages to sync routes`);
}
