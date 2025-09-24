<script lang="ts">
  import { darkPalette, lightPalette } from './palettes';
  import { setContext } from 'svelte';
  import { themeContextKey } from './themeContextKey';
  import { type ThemeContext } from './types';

  let { children } = $props();

  /** The theme context. */
  let themeContext: ThemeContext = $state({
    theme: 'dark',

    /** Switches to the specified theme. */
    switchTheme: function (theme: ThemeContext['theme']) {
      if (themeContext.theme !== theme) {
        switch (theme) {
          case 'dark':
            themeContext.theme = 'dark';
            break;
          case 'light':
            themeContext.theme = 'light';
            break;
        }
      }
    },

    /** Returns the current palette applied by the theme. */
    currentPalette: function () {
      switch (themeContext.theme) {
        case 'light':
          return lightPalette;
        case 'dark':
          return darkPalette;
      }
    },
  });

  // Sets the theme context to be used by other components.
  setContext<ThemeContext>(themeContextKey, themeContext);
</script>

{@render children()}
