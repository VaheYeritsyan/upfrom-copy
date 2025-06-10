import React from 'react';
import { Controller, UseControllerProps, FieldValues, PathValue } from 'react-hook-form';
import { TextFieldProps } from '@mui/material';
import { MobileDatePicker, MobileDatePickerProps } from '@mui/x-date-pickers-pro';
import dayjs, { OptionType } from 'dayjs';

export type Props<FV extends FieldValues> = Omit<TextFieldProps, 'error' | 'name' | 'value'> &
  UseControllerProps<FV> &
  Omit<MobileDatePickerProps, 'format' | 'minDateTime'> & {
    format?: OptionType;
    isStartDate?: boolean;
    isEndDate?: boolean;
  };

export const DateInputComponent = <FV extends FieldValues>({
  name,
  rules,
  label,
  control,
  format,
  variant,
  size,
  isStartDate,
  isEndDate,
  ...props
}: Props<FV>) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field: { value, onChange }, fieldState: { error, invalid } }) => (
      <MobileDatePicker
        {...props}
        slotProps={{
          textField: { error: invalid, label: `${label}${error ? ` • ${error?.message}` : ''}`, variant, size },
        }}
        value={dayjs(value, format)}
        onChange={newValue => {
          const date = newValue ? new Date(newValue.unix() * 1000) : null;

          if (isStartDate) date?.setHours(0, 0, 0, 0);
          if (isEndDate) date?.setHours(23, 59, 59, 999);

          onChange(date as PathValue<FV, typeof name>);
        }}
      />
    )}
  />
);
