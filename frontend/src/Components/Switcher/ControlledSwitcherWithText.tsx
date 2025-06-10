import React from 'react';
import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';
import { SwitcherWithText, Props as SwitcherWithTextProps } from '~Components/Switcher/SwitcherWithText';

type Props<FV extends FieldValues> = Pick<SwitcherWithTextProps, 'style' | 'title' | 'subtitle' | 'onChange'> &
  UseControllerProps<FV>;

export const ControlledSwitcherWithText = <FV extends FieldValues>({
  control,
  name,
  onChange,
  ...props
}: Props<FV>) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <SwitcherWithText
        {...props}
        value={field.value}
        onChange={value => {
          field.onChange(value);
          onChange?.(value);
        }}
      />
    )}
  />
);
