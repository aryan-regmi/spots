import { ServiceError } from '@/services/utils/error';

/** The error returned from a logger service. */
export class LoggerError extends Error implements ServiceError {
  constructor(kind: string, message: string, info?: any) {
    super();
    super.name = 'LoggerError';
    super.message = message;
    this.kind = kind;
    this.info = info;
  }
  kind: string;
  info?: any;
}

/** The logger service. */
export interface LoggerService {
  /** Writes message at TRACE level. */
  trace: (message: string) => void;

  /** Writes message at DEBUG level. */
  debug: (message: string) => void;

  /** Writes message at INFO level. */
  info: (message: string) => void;

  /** Writes message at WARN level. */
  warn: (message: string) => void;

  /** Writes message at ERROR level. */
  error: (message: string) => void;
}
