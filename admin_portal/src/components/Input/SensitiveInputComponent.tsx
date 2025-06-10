import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { FieldValues } from 'react-hook-form';
import { RemoveRedEye, VisibilityOff } from '@mui/icons-material';
import { InputComponent, Props as InputProps } from '~/components/Input/InputComponent';

type Props<FV extends FieldValues> = Omit<InputProps<FV>, 'InputProps'>;

export const SensitiveInputComponent = <FV extends FieldValues>({ ...props }: Props<FV>) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleClick = () => {
    setIsVisible(prevState => !prevState);
  };

  const endAdornment = (
    <IconButton size="small" onClick={handleClick}>
      {isVisible ? <RemoveRedEye /> : <VisibilityOff />}
    </IconButton>
  );

  return (
    <InputComponent
      {...props}
      autoComplete="current-password"
      type={isVisible ? 'text' : 'password'}
      InputProps={{ endAdornment }}
    />
  );
};
