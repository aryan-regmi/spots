import type { Palette } from './types';

/** The dark theme palette. */
export const darkPalette: Palette = {
  primary: { main: '#8AAEB5', contrast: '#1A1A1A' }, // Muted blue
  secondary: { main: '#A6BFA2', contrast: '#1A1A1A' }, // Dusty green
  accent: { main: '#D8A7A0', contrast: '#1A1A1A' }, // Soft rose
  tertiary: { main: '#D9A675', contrast: '#1A1A1A' }, // Warm peach
  info: { main: '#95CFC0', contrast: '#1A1A1A' }, // Cool mint
  success: { main: '#A3C9A8', contrast: '#1A1A1A' }, // Gentle green
  warning: { main: '#E2BC7C', contrast: '#1A1A1A' }, // Dusty gold
  error: { main: '#D19898', contrast: '#1A1A1A' }, // Dusty rose-red

  background: {
    default: '#1B1B1B', // Deep gray
    surface: '#2A2A2A', // Slightly lighter for cards, etc.
  },

  text: {
    primary: '#F0F0F0', // Near white
    secondary: '#BEBEBE', // Muted gray
    inverted: '#000000',
  },

  border: {
    light: '#3D3D3D', // Subtle gray for UI outlines
    strong: '#666666', // Stronger border for emphasis
  },

  basic: {
    primary: '#8AAEB5', // Match with primary
    secondary: '#D8A7A0', // Match with accent
  },
};

/** The light theme palette. */
export const lightPalette: Palette = {
  primary: { main: '#AEC6CF', contrast: '#1A1A1A' }, // Pastel blue
  secondary: { main: '#C5D8A4', contrast: '#1A1A1A' }, // Pastel green
  accent: { main: '#F7CAC9', contrast: '#1A1A1A' }, // Pastel pink
  tertiary: { main: '#FFD3B6', contrast: '#1A1A1A' }, // Soft peach
  info: { main: '#B5EAD7', contrast: '#1A1A1A' }, // Mint
  success: { main: '#D5E8D4', contrast: '#1A1A1A' }, // Light green
  warning: { main: '#FFE0AC', contrast: '#1A1A1A' }, // Pale orange
  error: { main: '#FFB3BA', contrast: '#1A1A1A' }, // Soft red

  background: {
    default: '#FDF6F0', // Very soft warm beige
    surface: '#FFFFFF', // Standard white for contrast
  },

  text: {
    primary: '#2E2E2E', // Soft black
    secondary: '#6E6E6E', // Muted gray
    inverted: '#FFFFFF',
  },

  border: {
    light: '#E4E4E4', // Light pastel gray
    strong: '#B0B0B0', // Medium pastel gray
  },

  basic: {
    primary: '#AEC6CF', // Matching primary
    secondary: '#F7CAC9', // Matching accent
  },
};
