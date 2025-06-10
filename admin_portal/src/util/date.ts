const LOCALE = 'en-us';

export const isDateKey = <T extends number | symbol | string>(key: T) => {
  const stringKey = typeof key === 'string' ? key : key.toString();

  return stringKey.endsWith('At') || stringKey.endsWith('Date') || stringKey === 'date';
};

export const isBirthdayKey = <T extends number | symbol | string>(key: T) => {
  return key === 'birthday';
};

export const getFullDateAndTime = (value: string | number | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  return date.toLocaleString(LOCALE, {
    hour: 'numeric',
    second: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getFullDate = (value: string | number | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  return date.toLocaleString(LOCALE, {
    year: 'numeric',
    day: '2-digit',
    month: '2-digit',
  });
};

export const getFullLongDate = (value: string | number | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  return date.toLocaleString(LOCALE, {
    year: 'numeric',
    day: '2-digit',
    month: 'long',
    weekday: 'long',
  });
};

export const getDateTime = (value: string | number | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  return date
    .toLocaleString(LOCALE, {
      hour: 'numeric',
      minute: 'numeric',
    })
    .toLowerCase()
    .replace(' ', '');
};

export const isDayMonthAndYearEqual = (firstDate: Date | string | number, secondDate: Date | string | number) => {
  const fDate = firstDate instanceof Date ? firstDate : new Date(firstDate);
  const sDate = secondDate instanceof Date ? secondDate : new Date(secondDate);

  return (
    fDate.toLocaleString(LOCALE, { day: '2-digit', month: 'long', year: 'numeric' }) ===
    sDate.toLocaleString(LOCALE, { day: '2-digit', month: 'long', year: 'numeric' })
  );
};
