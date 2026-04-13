import chalk from 'chalk';

export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug';

export interface Logger {
  info(message: string, ...args: unknown[]): void;
  success(message: string, ...args: unknown[]): void;
  warning(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
}

class ChalkLogger implements Logger {
  private format(level: LogLevel, message: string): string {
    const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    const prefix = {
      info: chalk.blue('[INFO]'),
      success: chalk.green('[SUCCESS]'),
      warning: chalk.yellow('[WARN]'),
      error: chalk.red('[ERROR]'),
      debug: chalk.gray('[DEBUG]'),
    }[level];
    return `${chalk.gray(timestamp)} ${prefix} ${message}`;
  }

  info(message: string, ...args: unknown[]): void {
    console.log(this.format('info', message), ...args);
  }

  success(message: string, ...args: unknown[]): void {
    console.log(this.format('success', message), ...args);
  }

  warning(message: string, ...args: unknown[]): void {
    console.warn(this.format('warning', message), ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(this.format('error', message), ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    if (process.env.DEBUG) {
      console.log(this.format('debug', message), ...args);
    }
  }
}

export const logger = new ChalkLogger();
