import React from 'react';
import { Controller, UseControllerProps, FieldValues } from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';
import InputMask, { Props as InputMaskProps } from 'react-input-mask';

export type Props<FV extends FieldValues> = Omit<TextFieldProps, 'error' | 'name' | 'value'> &
  UseControllerProps<FV> & {
    mask: InputMaskProps['mask'];
    maskChar?: InputMaskProps['maskChar'];
    maskPlaceholder?: InputMaskProps['maskPlaceholder'];
  };

export const MaskInputComponent = <FV extends FieldValues>({
  name,
  rules,
  label,
  control,
  variant = 'filled',
  size = 'medium',
  maskPlaceholder,
  maskChar,
  mask,
  ...inputProps
}: Props<FV>) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field: { value, onChange }, fieldState: { error, invalid } }) => (
      <InputMask
        mask={mask}
        value={value}
        disabled={inputProps.disabled}
        maskChar={maskChar}
        maskPlacehodler={maskPlaceholder}
        onChange={onChange}>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        {props => (
          <TextField
            {...props}
            {...inputProps}
            size={size}
            fullWidth
            error={invalid}
            variant={variant}
            label={`${label}${error ? ` • ${error?.message}` : ''}`}
          />
        )}
      </InputMask>
    )}
  />
);
