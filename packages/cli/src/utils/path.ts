import path from 'path';
import { fileURLToPath } from 'url';

// Get CLI root from global (set in index.ts)
let _cliRoot: string | undefined;

export function getCliRoot(): string {
  // Try to use the global __cliRoot set by index.ts
  const globalRoot = (global as unknown as { __cliRoot?: string }).__cliRoot;
  if (globalRoot) {
    return globalRoot;
  }

  // Use cached value if available
  if (_cliRoot) {
    return _cliRoot;
  }

  // Fallback: calculate from current module location
  // This happens when path.ts is imported before index.ts sets __cliRoot
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const isDist = currentDir.endsWith('dist') || currentDir.includes(path.sep + 'dist' + path.sep);

  if (isDist) {
    // We're in dist/utils or dist/commands, need to go up to cli/
    // path.dirname(dist/utils) = dist, path.dirname(dist) = cli
    _cliRoot = path.dirname(path.dirname(currentDir));
  } else {
    const isSrc = currentDir.endsWith('src') || currentDir.includes(path.sep + 'src' + path.sep);
    if (isSrc) {
      _cliRoot = path.dirname(path.dirname(currentDir));
    } else {
      _cliRoot = currentDir;
    }
  }

  return _cliRoot;
}

// Cached path roots
let _templatesRoot: string | undefined;
let _pluginsRoot: string | undefined;

export function getTemplatesRoot(): string {
  if (_templatesRoot) {
    return _templatesRoot;
  }
  _templatesRoot = path.resolve(getCliRoot(), '..', 'templates');
  return _templatesRoot;
}

export function getPluginsRoot(): string {
  if (_pluginsRoot) {
    return _pluginsRoot;
  }
  _pluginsRoot = path.resolve(getCliRoot(), '..', 'plugins');
  return _pluginsRoot;
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