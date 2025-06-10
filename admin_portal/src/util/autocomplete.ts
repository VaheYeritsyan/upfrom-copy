import { FilterOptionsState } from '@mui/material';
import { User, Team, Organization } from '@up-from/graphql-ap/genql';

export const replaceSpecialCharacters = (value: string) => {
  return value.replace(/[/,!?_+]/g, '\\$&');
};

export const filterUserOptions = (options: User[], { inputValue }: FilterOptionsState<User>) => {
  if (!inputValue.trim()) return options;
  const value = replaceSpecialCharacters(inputValue);
  const valueRegExp = new RegExp(value, 'i');

  return options.filter(
    option =>
      valueRegExp.test(option.id) ||
      valueRegExp.test([option.firstName, option.lastName].join(' ')) ||
      (option.email && valueRegExp.test(option.email)) ||
      (option.phone && valueRegExp.test(option.phone)),
  );
};

export const filterTeamOptions = <T extends Pick<Team, 'name' | 'id'>>(
  options: T[],
  { inputValue }: FilterOptionsState<T>,
) => {
  if (!inputValue.trim()) return options;
  const value = replaceSpecialCharacters(inputValue);

  const valueRegExp = new RegExp(value, 'i');

  return options.filter(option => valueRegExp.test(option.id) || valueRegExp.test(option.name));
};

export const filterOrganizationOptions = <T extends Pick<Organization, 'name' | 'id'>>(
  options: T[],
  { inputValue }: FilterOptionsState<T>,
) => {
  if (!inputValue.trim()) return options;
  const value = replaceSpecialCharacters(inputValue);

  const valueRegExp = new RegExp(value, 'i');

  return options.filter(option => valueRegExp.test(option.id) || valueRegExp.test(option.name));
};
