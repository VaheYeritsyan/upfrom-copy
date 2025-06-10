const LOCALE = 'en-us';

const MONTH_SHORT_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getMonthAndYear = (value: number | string | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  return date.toLocaleDateString(LOCALE, { year: 'numeric', month: 'long' });
};

export const getMonthAndDay = (value: number | string | Date, separator = ' • ') => {
  const date = value instanceof Date ? value : new Date(value);

  return date
    .toLocaleDateString(LOCALE, { day: '2-digit', weekday: 'long', month: 'long' })
    .replace(/(, | at )/g, separator);
};

export const getMonthDayAndYear = (value: number | string | Date, separator = ' • ') => {
  const date = value instanceof Date ? value : new Date(value);

  return date
    .toLocaleDateString(LOCALE, { day: '2-digit', weekday: 'long', month: 'long', year: 'numeric' })
    .replace(/(, | at )/g, separator);
};

export const getFullTextDate = (value: number | string | Date, separator = ' • ') => {
  const date = value instanceof Date ? value : new Date(value);

  return date.toLocaleDateString(LOCALE, { year: 'numeric', day: '2-digit', month: 'long' }).replace(',', separator);
};

export const getFullTextDateTime = (value: number | string | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  return date.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const getFullTextDateAndTime = (value: number | string | Date, separator = ' • ') => {
  const date = value instanceof Date ? value : new Date(value);

  return date
    .toLocaleDateString(LOCALE, {
      day: '2-digit',
      weekday: 'long',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(/(, | at )/g, separator);
};

export const getFullTextDateAndTimeWithSeconds = (value: number | string | Date, separator = ' • ') => {
  const date = value instanceof Date ? value : new Date(value);

  return date
    .toLocaleDateString(LOCALE, {
      day: '2-digit',
      weekday: 'long',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    .replace(/(, | at )/g, separator);
};

export const addTodayToDateString = (value: string, separator = ' ') => {
  const [, ...words] = value.split(separator);

  return ['Today', ...words].join(separator);
};

export const setDate = (target: Date, value: Date) => {
  const withDay = new Date(target.setDate(value.getDate()));
  const withMonth = new Date(withDay.setMonth(value.getMonth()));

  return withMonth.setFullYear(value.getFullYear());
};

export const getIsDateToday = (compareDate: number | string | Date) => {
  if (
    new Date(compareDate).toLocaleString(LOCALE, { day: '2-digit', month: 'long', year: 'numeric' }) ===
    new Date().toLocaleString(LOCALE, { day: '2-digit', month: 'long', year: 'numeric' })
  ) {
    return true;
  }
  return false;
};

export const getIsDateYesterday = (compareDate: number | string | Date) => {
  const today = new Date();

  if (
    new Date(compareDate).toLocaleString(LOCALE, { day: '2-digit', month: 'long', year: 'numeric' }) ===
    new Date(today.setDate(today.getDate() - 1)).toLocaleString(LOCALE, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  ) {
    return true;
  }
  return false;
};

export const getDateFromNow = (value: number | string | Date, separator = ' • ') => {
  const date = value instanceof Date ? value : new Date(value);

  const isToday = getIsDateToday(date);
  if (isToday) return 'Today';

  const isYesterday = getIsDateYesterday(date);
  if (isYesterday) return 'Yesterday';

  const showYear = date.getFullYear() !== new Date().getFullYear();
  return date
    .toLocaleDateString(LOCALE, {
      day: 'numeric',
      month: 'short',
      weekday: 'long',
      ...(showYear ? { year: 'numeric' } : {}),
    })
    .replace(', ', separator);
};

export const getDateAndTimeFromNow = (value: number | string | Date, separator = ' • ') => {
  const date = value instanceof Date ? value : new Date(value);

  const dateString = getDateFromNow(date);
  const timeString = date.toLocaleTimeString(LOCALE, { hour12: true, minute: '2-digit', hour: 'numeric' });

  return `${dateString}${separator}${timeString}`;
};

export const getIsoDateString = (value: Date | string | number) => {
  const date = value instanceof Date ? value : new Date(value);

  return date.toISOString();
};

export const getDateFromShortDateString = (dateString: string) => {
  const [monthString, dayString, yearString] = dateString.split(' ');

  const month = getMonthNumberFromShortName(monthString);
  const day = parseInt(dayString, 10);
  const year = yearString ? parseInt(yearString, 10) : new Date().getFullYear();

  return new Date(year, month, day);
};

export const getMonthNumberFromShortName = (month: string) => {
  return MONTH_SHORT_NAMES.indexOf(month);
};
