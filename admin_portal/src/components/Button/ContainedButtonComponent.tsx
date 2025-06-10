import React, { FC } from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';

export type Props = ButtonProps & {
  isLoading?: boolean;
};

const loadingSizes: { [K in Required<ButtonProps>['size']]: number } = {
  large: 16,
  medium: 14,
  small: 12,
};

export const ContainedButtonComponent: FC<Props> = ({ isLoading, size = 'large', children, disabled, ...props }) => (
  <Button
    {...props}
    variant="contained"
    size={size}
    startIcon={isLoading ? <CircularProgress color="inherit" size={loadingSizes[size]} /> : props.startIcon}
    disabled={disabled || isLoading}>
    {children}
  </Button>
);
