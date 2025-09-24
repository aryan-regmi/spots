/** The context for the theme. */
export type ThemeContext = {
  theme: 'light' | 'dark';
  switchTheme: (theme: ThemeContext['theme']) => void;
  currentPalette: () => Palette;
};

/** Represents a palette. */
export type Palette = {
  primary: { main: string; contrast: string };
  secondary: { main: string; contrast: string };
  accent: { main: string; contrast: string };
  background: { default: string; surface: string };
  text: {
    primary: string;
    secondary: string;
    inverted: string;
  };
  border: {
    light: string;
    strong: string;
  };
  basic: { primary: string; secondary: string };
};
