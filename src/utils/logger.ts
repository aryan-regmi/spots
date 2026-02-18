import { invoke } from '@tauri-apps/api/core';

/** Provides logging implementations by calling rust functions. */
export const Logger = {
  debug: (msg: string, spanId: string = 'FRONTEND') => {
    return invoke('debug', { msg, spanId });
  },

  trace: (msg: string, spanId: string = 'FRONTEND') => {
    return invoke('trace', { msg, spanId });
  },

  info: (msg: string, spanId: string = 'FRONTEND') => {
    return invoke('info', { msg, spanId });
  },

  warn: (msg: string, spanId: string = 'FRONTEND') => {
    return invoke('warn', { msg, spanId });
  },

  error: (msg: string, spanId: string = 'FRONTEND') => {
    return invoke('error', { msg, spanId });
  },
};
