import ora from 'ora';
import type { Ora } from 'ora';

/**
 * Spinner wrapper that silently handles disabled/no-op cases.
 * This encapsulates the conditional spinner logic and eliminates
 * the need for "if (spinner)" checks throughout command functions.
 */
export class Spinner {
  private ora: Ora | null;

  constructor(enabled: boolean, text: string) {
    this.ora = enabled ? ora(text).start() : null;
  }

  set text(message: string) {
    if (this.ora) {
      this.ora.text = message;
    }
  }

  succeed(message?: string): void {
    if (this.ora) {
      this.ora.succeed(message);
    }
  }

  fail(message?: string): void {
    if (this.ora) {
      this.ora.fail(message);
    }
  }

  info(message?: string): void {
    if (this.ora) {
      this.ora.info(message);
    }
  }

  warn(message?: string): void {
    if (this.ora) {
      this.ora.warn(message);
    }
  }

  start(text?: string): this {
    if (this.ora) {
      this.ora.start(text);
    }
    return this;
  }

  stop(): void {
    if (this.ora) {
      this.ora.stop();
    }
  }

  stopAndPersist(options?: { text?: string; symbol?: string }): void {
    if (this.ora) {
      this.ora.stopAndPersist(options);
    }
  }

  clear(): void {
    if (this.ora) {
      this.ora.clear();
    }
  }

  get isEnabled(): boolean {
    return this.ora !== null;
  }
}
