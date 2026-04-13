import type { FsdkPlugin, PluginContext } from '../core/index.js';
import { logger } from '../utils/index.js';

export const addComponentPlugin: FsdkPlugin = {
  name: 'add-component',
  version: '0.1.0',
  enabled: true,

  async beforeRegister(context: PluginContext): Promise<void> {
    logger.debug('AddComponent plugin: beforeRegister');
  },

  async afterRegister(context: PluginContext): Promise<void> {
    logger.debug('AddComponent plugin: afterRegister');
  },

  async beforeExec(context: PluginContext, componentName: string, type: string): Promise<void> {
    logger.debug(`AddComponent plugin: beforeExec componentName=${componentName}, type=${type}`);
  },

  async afterExec(context: PluginContext, componentName: string, result: unknown): Promise<void> {
    logger.debug(`AddComponent plugin: afterExec componentName=${componentName}`);
    logger.success(`Component ${componentName} added successfully via plugin`);
  },

  onError(error: Error, context: PluginContext): void {
    logger.error('AddComponent plugin: error caught', error.message);
  },
};

export default addComponentPlugin;
