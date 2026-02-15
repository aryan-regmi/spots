import { LoggerService } from '@/services/logger/service';
import { warn, debug, trace, info, error } from '@tauri-apps/plugin-log';

/** Provides the logger service. */
class LoggerProvider implements LoggerService {
  trace(message: string): void {
    trace(message);
  }

  debug(message: string): void {
    debug(message);
  }

  info(message: string): void {
    info(message);
  }

  warn(message: string): void {
    warn(message);
  }

  error(message: string): void {
    error(message);
  }
}

/** Hook to use the logger service. */
export function useLogger() {
  const logger = new LoggerProvider();
  return logger;
}
