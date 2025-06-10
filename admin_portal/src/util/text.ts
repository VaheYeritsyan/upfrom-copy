import { getPlural } from 'frontend/src/utils/textFormat';

const LOCALE = 'en-us';

export const getTitleFromKey = (key: string | number | symbol) => {
  const result = key.toString().replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const getBooleanValue = (
  value: boolean | undefined | null,
  values: [string, string] | [string, string, string] = ['Yes', 'No', '[None]'],
) => {
  if (typeof value === 'undefined' || value === null) return values[2] || 'None';

  return value ? values[0] : values[1];
};

export const getNotificationSuccessMessageInPlural = (entitiesCount: number, entity: string, message: string) => {
  return `${entitiesCount} ${getPlural(entity, entitiesCount)} ${entitiesCount > 1 ? 'have' : 'has'} ${message}`;
};

export const getFormattedNumber = (value?: string | number) => {
  if (!value) return value;

  const number = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(number)) return value;

  return number.toLocaleString(LOCALE);
};
