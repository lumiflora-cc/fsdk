import type { FsdkPlugin, PluginContext } from '../core/index.js';
import { logger } from '../utils/index.js';

export const corePlugin: FsdkPlugin = {
  name: 'core',
  version: '0.1.0',
  enabled: true,

  async beforeRegister(context: PluginContext): Promise<void> {
    logger.debug('Core plugin: beforeRegister');
  },

  async afterRegister(context: PluginContext): Promise<void> {
    logger.debug('Core plugin: afterRegister');
  },

  async beforeExec(context: PluginContext, command: string): Promise<void> {
    logger.debug(`Core plugin: beforeExec command=${command}`);
  },

  async afterExec(context: PluginContext, command: string, result: unknown): Promise<void> {
    logger.debug(`Core plugin: afterExec command=${command}`);
  },

  onError(error: Error, context: PluginContext): void {
    logger.error('Core plugin: error caught', error.message);
  },
};

export default corePlugin;
