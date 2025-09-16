import type { Component } from 'svelte';

/** The navigation context. */
export type NavContext = {
  navigateTo: (path: string, options?: { replace?: boolean }) => Promise<void>;
  getLocation: () => string | undefined;
  setLocation: (path: string) => Promise<void>;
};

/** Represents a route. */
export type Route = { path: string; component: Component };
