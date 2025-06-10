import React from 'react';
import { Controller, UseControllerProps, FieldValues } from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';

export type Props<FV extends FieldValues> = Omit<TextFieldProps, 'error' | 'name' | 'value'> &
  UseControllerProps<FV> & { isNotEditable?: boolean };

export const InputComponent = <FV extends FieldValues>({
  name,
  rules,
  label,
  control,
  variant = 'filled',
  size = 'medium',
  isNotEditable,
  ...props
}: Props<FV>) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field: { value, onChange }, fieldState: { error, invalid } }) => (
      <TextField
        size={size}
        fullWidth
        error={invalid}
        value={value || ''}
        onChange={isNotEditable ? undefined : onChange}
        variant={variant}
        label={`${label}${error ? ` • ${error?.message}` : ''}`}
        {...props}
      />
    )}
  />
);
