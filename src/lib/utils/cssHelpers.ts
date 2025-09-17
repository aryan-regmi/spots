export const toCssString = (styleObject: {
  [key: string]: string | number;
}): string => {
  return Object.entries(styleObject)
    .map(([key, value]) => `${camelToKebab(key)}: ${value};`)
    .join(' ');
};

// Convert camelCase to kebab-case (CSS property format)
export const camelToKebab = (str: string) => {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};
