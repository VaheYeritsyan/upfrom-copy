const isWhiteContrastColor = (rgb: number[]) => {
  const [r, g, b] = rgb.map(value => value / 255);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5;
};

export const getColorFromString = (value?: string): string => {
  if (!value) return '';
  const string = value.replace(/\s/g, '');

  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  const r = (hash & 0xff0000) >> 16;
  const g = (hash & 0x00ff00) >> 8;
  const b = hash & 0x0000ff;

  const color = `rgb(${r}, ${g}, ${b})`;
  if (!isWhiteContrastColor([r, g, b])) {
    return `rgb(${r}, ${g - g / 1.5}, ${b - b / 1.5})`;
  }

  return color;
};
