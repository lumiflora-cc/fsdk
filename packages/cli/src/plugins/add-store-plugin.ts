import type { FsdkPlugin, PluginContext } from '../core/index.js';
import { logger } from '../utils/index.js';

export const addStorePlugin: FsdkPlugin = {
  name: 'add-store',
  version: '0.1.0',
  enabled: true,

  async beforeRegister(context: PluginContext): Promise<void> {
    logger.debug('AddStore plugin: beforeRegister');
  },

  async afterRegister(context: PluginContext): Promise<void> {
    logger.debug('AddStore plugin: afterRegister');
  },

  async beforeExec(context: PluginContext, storeName: string, type: string): Promise<void> {
    logger.debug(`AddStore plugin: beforeExec storeName=${storeName}, type=${type}`);
  },

  async afterExec(context: PluginContext, storeName: string, result: unknown): Promise<void> {
    logger.debug(`AddStore plugin: afterExec storeName=${storeName}`);
    logger.success(`Store ${storeName} added successfully via plugin`);
  },

  onError(error: Error, context: PluginContext): void {
    logger.error('AddStore plugin: error caught', error.message);
  },
};

export default addStorePlugin;
