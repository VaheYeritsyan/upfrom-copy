import React from 'react';
import { Controller, UseControllerProps, FieldValues, PathValue } from 'react-hook-form';
import { TextFieldProps } from '@mui/material';
import { MobileDateTimePicker, MobileDateTimePickerProps } from '@mui/x-date-pickers-pro';
import dayjs, { OptionType } from 'dayjs';

export type Props<FV extends FieldValues> = Omit<TextFieldProps, 'error' | 'name' | 'value'> &
  UseControllerProps<FV> &
  Omit<MobileDateTimePickerProps, 'format' | 'minDateTime'> & {
    format?: OptionType;
  };

export const DateTimeInputComponent = <FV extends FieldValues>({
  name,
  rules,
  label,
  control,
  format,
  variant,
  size,
  ...props
}: Props<FV>) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field: { value, onChange }, fieldState: { error, invalid } }) => (
      <MobileDateTimePicker
        {...props}
        slotProps={{
          textField: { error: invalid, label: `${label}${error ? ` • ${error?.message}` : ''}`, variant, size },
        }}
        value={dayjs(value, format)}
        onChange={newValue => {
          const dateString = newValue?.unix();
          onChange((dateString ? new Date(dateString * 1000) : null) as PathValue<FV, typeof name>);
        }}
      />
    )}
  />
);
