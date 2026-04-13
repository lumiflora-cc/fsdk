/**
 * Enable debug mode by setting the DEBUG environment variable
 */
export function enableDebugMode(debug?: boolean): void {
  if (debug) {
    process.env.DEBUG = '1';
  }
}

/**
 * Resolve the current working directory
 */
export function resolveCwd(cwd?: string): string {
  return cwd || process.cwd();
}

/**
 * String conversion utilities
 */
export function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function toCamelCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}