/**
 * 统一日志工具
 * 生产环境不输出日志，开发环境输出到控制台
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

class Logger {
  private isDev = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };
  }

  info(message: string, ...args: unknown[]): void {
    if (this.isDev) {
      const entry = this.formatMessage('info', message, args);
      console.info(`[INFO] ${entry.message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.isDev) {
      const entry = this.formatMessage('warn', message, args);
      console.warn(`[WARN] ${entry.message}`, ...args);
    }
  }

  error(message: string, error?: unknown): void {
    const entry = this.formatMessage('error', message, error);
    console.error(`[ERROR] ${entry.message}`, error);
    // TODO: 可以在这里集成 Sentry 等错误追踪服务
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.isDev) {
      const entry = this.formatMessage('debug', message, args);
      console.debug(`[DEBUG] ${entry.message}`, ...args);
    }
  }
}

export const logger = new Logger();
