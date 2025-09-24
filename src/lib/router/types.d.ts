import type { Component } from 'svelte';

/** Represents a navigation context. */
export type NavContext = {
  navigateTo: (string, options?: { replace?: boolean }) => void;
  navigateBack: () => void;
};
