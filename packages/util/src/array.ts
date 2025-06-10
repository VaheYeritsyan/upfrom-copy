export function exclude<T>(array: Array<T>, excluder: T): void {
  const excluderIndex = array.findIndex(entry => entry === excluder);
  if (excluderIndex !== -1) {
    array.splice(excluderIndex, 1);
  }
}

export function split<T>(array: Array<T>, limit: number) {
  const chunks: Array<Array<T>> = [];
  for (let i = 0; i < array.length; i += limit) {
    chunks.push(array.slice(i, i + limit));
  }
  return chunks;
}

export * as ArrayUtil from './array.js';
