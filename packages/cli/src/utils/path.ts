import path from 'path';
import { fileURLToPath } from 'url';

export function getCliRoot(): string {
  return path.resolve(fileURLToPath(import.meta.url), '../..');
}

export function getTemplatesRoot(): string {
  return path.resolve(getCliRoot(), '../templates');
}

export function getPluginsRoot(): string {
  return path.resolve(getCliRoot(), '../plugins');
}

export function resolveTemplatePath(templateName: string, ...segments: string[]): string {
  return path.resolve(getTemplatesRoot(), templateName, ...segments);
}

export function resolvePluginPath(pluginName: string, ...segments: string[]): string {
  return path.resolve(getPluginsRoot(), pluginName, ...segments);
}

export function normalizePath(inputPath: string): string {
  return path.normalize(inputPath).replace(/\\/g, '/');
}

export function isAbsolutePath(inputPath: string): boolean {
  return path.isAbsolute(inputPath);
}

export function makeRelative(to: string, from: string): string {
  return path.relative(from, to).replace(/\\/g, '/');
}
