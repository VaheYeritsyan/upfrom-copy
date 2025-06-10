export const getColor = (string?: string | null) => {
  if (!string) return '';

  let hash = 0;
  if (string.length === 0) return '';
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 255;
    color += ('00' + value.toString(16)).slice(-2);
  }

  return color;
};

export const isBlackContrast = (hex: string) => {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  return yiq >= 128;
};

export const getContrastColor = (bgHex: string) => {
  return isBlackContrast(bgHex) ? '#000' : '#FFF';
};
