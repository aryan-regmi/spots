import type { Component } from 'svelte';

/** Represents a navigation context. */
export type NavContext = {
  currentComponent: () => Component | undefined;
  setCurrentComponent: (component: Component) => void;
  navigateTo: (string, options?: { replace?: boolean }) => void;
};
