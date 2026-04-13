import type { FsdkPlugin, PluginContext } from '../core/index.js';
import { logger } from '../utils/index.js';

export const addPagePlugin: FsdkPlugin = {
  name: 'add-page',
  version: '0.1.0',
  enabled: true,

  async beforeRegister(context: PluginContext): Promise<void> {
    logger.debug('AddPage plugin: beforeRegister');
  },

  async afterRegister(context: PluginContext): Promise<void> {
    logger.debug('AddPage plugin: afterRegister');
  },

  async beforeExec(context: PluginContext, pageName: string, routerPath: string): Promise<void> {
    logger.debug(`AddPage plugin: beforeExec pageName=${pageName}, routerPath=${routerPath}`);
  },

  async afterExec(context: PluginContext, pageName: string, result: unknown): Promise<void> {
    logger.debug(`AddPage plugin: afterExec pageName=${pageName}`);
    logger.success(`Page ${pageName} added successfully via plugin`);
  },

  onError(error: Error, context: PluginContext): void {
    logger.error('AddPage plugin: error caught', error.message);
  },
};

export default addPagePlugin;
