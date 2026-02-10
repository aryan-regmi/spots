/** The state for the logger service. */
export type LoggerState = {};

/** Defines the interface for the logger service. */
export interface LoggerService {
  state: LoggerState;

  /** Logs data with no log level. */
  log: (...data: any[]) => void;

  /** Logs data at the `TRACE` level. */
  trace: (...data: any[]) => void;

  /** Logs data at the `DEBUG` level. */
  debug: (...data: any[]) => void;

  /** Logs data at the `INFO` level. */
  info: (...data: any[]) => void;

  /** Logs data at the `WARN` level. */
  warn: (...data: any[]) => void;

  /** Logs data at the `ERROR` level. */
  error: (...data: any[]) => void;

  /** Logs data at the `FATAL` level. */
  fatal: (...data: any[]) => void;
}
