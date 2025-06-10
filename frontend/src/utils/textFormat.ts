export const getInitials = (value: string, separator = /\s/) => {
  if (!value) return '';

  const words = value.split(separator);
  if (words.length === 1) return `${words[0].at(0) || ''}${words[0].at(-1) || ''}`;

  return `${words[0].at(0) || ''}${words.at(-1)?.at(0) || ''}`;
};

export const getPlural = (word: string, quantity: number) => {
  return `${word}${quantity === 1 ? '' : 's'}`;
};

export const getMergedText = (paths: string[], separator = ' • ') => {
  return paths.join(separator);
};
