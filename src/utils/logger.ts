import { invoke } from '@tauri-apps/api/core';

/** Provides logging implementations by calling rust functions. */
export const Logger = {
  debug: (msg: string, data?: any) => {
    return invoke('debug', { msg, data });
  },

  trace: (msg: string, data?: any) => {
    return invoke('trace', { msg, data });
  },

  info: (msg: string, data?: any) => {
    return invoke('info', { msg, data });
  },

  warn: (msg: string, data?: any) => {
    return invoke('warn', { msg, data });
  },

  error: (msg: string, data?: any) => {
    return invoke('error', { msg, data });
  },
};
