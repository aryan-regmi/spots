import { LoggerService } from './service';
import { Component, createContext, useContext } from 'solid-js';

/** Initalizes the provider for the `LoggerService` */
export function initLoggerProvider(): LoggerService {
  return {
    state: {},
    log: console.log,
    trace: console.trace,
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
    fatal: console.error,
  };
}

// --------Context Provider-------- //
// -------------------------------- //

const LoggerContext = createContext<LoggerService>();

export const LoggerContextProvider: Component<{ children: any }> = (props) => {
  const logger = initLoggerProvider();

  return (
    <LoggerContext.Provider value={logger}>
      {props.children}
    </LoggerContext.Provider>
  );
};

/** Hook to use the logger service. */
export function useLogger() {
  const logger = useContext(LoggerContext);
  if (!logger) {
    throw new Error('useLogger must be used within LoggerContextProvider');
  }
  return logger;
}
