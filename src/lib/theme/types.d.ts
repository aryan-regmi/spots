/** The key for the theme context. */
export const themeContextKey = Symbol();

/** The context for the theme. */
export type ThemeContext = {
  theme: 'light' | 'dark';
  switchTheme: (theme: ThemeContext['theme']) => void;
  palette: string[];
};

/** The dark theme palette. */
export const darkPalette = [
  '#4D5382',
  '#514663',
  '#8CBA80',
  '#B3B3F1',
  '#CACF85',
];

/** The light theme palette. */
export const lightPalette = [
  '#555B6E',
  '#72E1D1',
  '#7EA172',
  '#BCCCF0',
  '#FFD6BA',
];
