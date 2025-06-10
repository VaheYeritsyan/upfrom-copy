import React, { forwardRef } from 'react';
import { Tooltip, Button, ButtonProps } from '@mui/material';

export type Props = Omit<ButtonProps, 'variant'> & {
  tooltipTitle?: string;
};

const minWidth: { [K in Required<ButtonProps>['size']]: number } = {
  small: 32,
  medium: 36,
  large: 48,
};

// eslint-disable-next-line react/display-name
export const IconButtonComponent = forwardRef<HTMLButtonElement, Props>(
  ({ sx, children, tooltipTitle, size = 'small', ...props }, ref) => (
    <Tooltip title={tooltipTitle}>
      <Button {...props} ref={ref} sx={{ minWidth: minWidth[size], ...sx }} size={size} variant="text">
        {children}
      </Button>
    </Tooltip>
  ),
);
