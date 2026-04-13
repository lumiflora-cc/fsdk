import { logger } from '../utils/index.js';
import type { PluginContext } from './config-loader.js';

export interface FsdkPlugin {
  name: string;
  version?: string;
  enabled?: boolean;
  beforeRegister?(context: PluginContext): Promise<void> | void;
  afterRegister?(context: PluginContext): Promise<void> | void;
  beforeExec?(context: PluginContext, ...args: unknown[]): Promise<void> | void;
  afterExec?(context: PluginContext, ...args: unknown[]): Promise<void> | void;
  onError?(error: Error, context: PluginContext): void;
}

export interface PluginManager {
  register(plugin: FsdkPlugin): void;
  unregister(name: string): void;
  get(name: string): FsdkPlugin | undefined;
  list(): FsdkPlugin[];
  execHook<K extends 'beforeRegister' | 'afterRegister'>(
    hook: K,
    context: PluginContext
  ): Promise<void>;
  execHook<K extends 'beforeExec' | 'afterExec'>(
    hook: K,
    context: PluginContext,
    ...args: unknown[]
  ): Promise<void>;
}

class PluginSystem implements PluginManager {
  private plugins: Map<string, FsdkPlugin> = new Map();

  async loadBuiltInPlugins(context: PluginContext): Promise<void> {
    const builtInPlugins = [
      '../plugins/core-plugin.js',
      '../plugins/add-page-plugin.js',
      '../plugins/add-component-plugin.js',
      '../plugins/add-store-plugin.js',
    ];

    for (const pluginPath of builtInPlugins) {
      try {
        const plugin = await import(pluginPath) as { default?: FsdkPlugin; } & FsdkPlugin;
        const pluginInstance = plugin.default || plugin;
        if (pluginInstance) {
          this.register(pluginInstance);
          logger.debug(`Loaded built-in plugin: ${pluginInstance.name}`);
        }
      } catch (err) {
        logger.debug(`Failed to load plugin ${pluginPath}:`, err);
      }
    }

    await this.execHook('afterRegister', context);
  }

  register(plugin: FsdkPlugin): void {
    if (!plugin.name) {
      throw new Error('Plugin must have a name');
    }
    if (this.plugins.has(plugin.name)) {
      logger.warning(`Plugin ${plugin.name} is already registered, skipping`);
      return;
    }
    this.plugins.set(plugin.name, plugin);
    logger.debug(`Registered plugin: ${plugin.name}`);
  }

  unregister(name: string): void {
    this.plugins.delete(name);
    logger.debug(`Unregistered plugin: ${name}`);
  }

  get(name: string): FsdkPlugin | undefined {
    return this.plugins.get(name);
  }

  list(): FsdkPlugin[] {
    return Array.from(this.plugins.values());
  }

  async execHook<K extends 'beforeRegister' | 'afterRegister'>(
    hook: K,
    context: PluginContext
  ): Promise<void>;
  async execHook<K extends 'beforeExec' | 'afterExec'>(
    hook: K,
    context: PluginContext,
    ...args: unknown[]
  ): Promise<void>;
  async execHook(
    hook: keyof FsdkPlugin,
    context: PluginContext,
    ...args: unknown[]
  ): Promise<void> {
    const promises = Array.from(this.plugins.values())
      .filter((p) => p.enabled !== false)
      .map(async (plugin) => {
        const hookFn = plugin[hook];
        if (typeof hookFn === 'function') {
          try {
            await (hookFn as (...args: unknown[]) => Promise<void>).apply(plugin, [context, ...args]);
          } catch (error) {
            if (plugin.onError && error instanceof Error) {
              plugin.onError(error, context);
            } else {
              logger.error(`Plugin ${plugin.name} hook ${hook} failed:`, error);
            }
          }
        }
      });

    await Promise.all(promises);
  }
}

export const pluginSystem = new PluginSystem();
