import type { Palette } from './types';

/** The dark theme palette. */
export const darkPalette: Palette = {
  primary: { main: '#8DA4B1', contrast: '#1A1A1A' }, // Soft desaturated blue
  secondary: { main: '#A9BDB0', contrast: '#1A1A1A' }, // Gentle muted green
  accent: { main: '#E8D5D0', contrast: '#1A1A1A' }, // Light blush
  background: {
    default: '#1F1F1F',
    surface: '#2A2A2A',
  },
  text: {
    primary: '#F0F0F0',
    secondary: '#C2C2C2',
    inverted: '#000000',
  },
  border: {
    light: '#3A3A3A',
    strong: '#5A5A5A',
  },
  basic: {
    primary: '#8DA4B1',
    secondary: '#E8D5D0',
  },
};

/** The light theme palette. */
export const lightPalette: Palette = {
  primary: { main: '#6C7A89', contrast: '#ffffff' }, // Slate gray-blue
  secondary: { main: '#A3B5A6', contrast: '#ffffff' }, // Dusty green-gray
  accent: { main: '#E3C9C1', contrast: '#000000' }, // Warm blush
  background: {
    default: '#FAFAFA',
    surface: '#FFFFFF',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    inverted: '#FFFFFF',
  },
  border: {
    light: '#E6E6E6',
    strong: '#BFBFBF',
  },
  basic: {
    primary: '#6C7A89',
    secondary: '#E3C9C1',
  },
};
