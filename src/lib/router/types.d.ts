import type { Component } from 'svelte';

/** The navigation context. */
export type NavContext = {
  navigateTo: (path: string) => Promise<void>;
  getLocation: () => string;
  setLocation: (path: string) => Promise<void>;
};

/** Represents a route. */
export type Route = { path: string; component: Component };
