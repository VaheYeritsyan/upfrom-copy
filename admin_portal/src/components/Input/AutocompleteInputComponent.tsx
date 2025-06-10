import React from 'react';
import { Controller, UseControllerProps, FieldValues, FieldPathValue } from 'react-hook-form';
import { TextField, TextFieldProps, Autocomplete, AutocompleteProps } from '@mui/material';

export type AutocompleteOption = {
  label: string;
  value: string;
};

export type Props<FV extends FieldValues, Option> = Omit<TextFieldProps, 'error' | 'name' | 'value'> &
  Pick<
    AutocompleteProps<Option, boolean, boolean, boolean>,
    | 'renderOption'
    | 'getOptionLabel'
    | 'filterOptions'
    | 'isOptionEqualToValue'
    | 'renderTags'
    | 'multiple'
    | 'onInputChange'
  > &
  UseControllerProps<FV> & {
    options: Option[];
    isLoading?: boolean;
  };

const defaultIsOptionEqualToValue = <Option,>(option: Option, value: Option) =>
  (option as AutocompleteOption).value === (value as AutocompleteOption).value;

export const AutocompleteInputComponent = <FV extends FieldValues, Option>({
  name,
  rules,
  label,
  control,
  renderOption,
  isLoading,
  variant = 'filled',
  size = 'medium',
  filterOptions,
  getOptionLabel,
  renderTags,
  multiple,
  isOptionEqualToValue = defaultIsOptionEqualToValue,
  options,
  disabled,
  onInputChange,
  ...props
}: Props<FV, Option>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { value, onChange }, fieldState: { error, invalid } }) => (
        <Autocomplete
          options={options}
          disabled={disabled}
          clearIcon={null}
          loading={isLoading}
          multiple={multiple}
          isOptionEqualToValue={isOptionEqualToValue}
          getOptionLabel={getOptionLabel}
          renderTags={renderTags}
          filterOptions={filterOptions}
          onChange={(_, value) => onChange(value as FieldPathValue<FV, typeof name>)}
          value={value || null}
          renderOption={renderOption}
          fullWidth
          onInputChange={onInputChange}
          renderInput={params => (
            <TextField
              {...props}
              {...params}
              size={size}
              fullWidth
              error={invalid}
              variant={variant}
              label={`${label}${error ? ` • ${error?.message}` : ''}`}
            />
          )}
        />
      )}
    />
  );
};
