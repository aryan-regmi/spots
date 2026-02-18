import { invoke } from '@tauri-apps/api/core';

/** Provides logging implementations by calling rust functions. */
export const Logger = {
  debug: (msg: string) => {
    return invoke('debug', { msg });
  },

  trace: (msg: string) => {
    return invoke('trace', { msg });
  },

  info: (msg: string) => {
    return invoke('info', { msg });
  },

  warn: (msg: string) => {
    return invoke('warn', { msg });
  },

  error: (msg: string) => {
    return invoke('error', { msg });
  },
};
