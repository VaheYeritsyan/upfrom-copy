import React, { MouseEvent, useEffect } from 'react';
import { ButtonProps, Menu, MenuItem, Box } from '@mui/material';
import { ContainedButtonComponent } from '~/components/Button/ContainedButtonComponent';

export type Props<Option extends string | number> = ButtonProps & {
  options?: Option[];
  disabledOptions?: Option[];
  isLoading?: boolean;
  onOptionClick?: (option: Option) => void;
};

const dangerOptionsRegExp = new RegExp(/delete|disable|remove|cancel/i);
const friendlyOptionsRegExp = new RegExp(/enable|restore/i);

export const DropdownButton = <Option extends string | number>({
  children,
  options,
  disabledOptions,
  disabled,
  isLoading,
  onOptionClick,
  ...props
}: Props<Option>) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isOpen = !!anchorEl;

  useEffect(() => {
    if (!isLoading) return;

    setAnchorEl(null);
  }, [isLoading]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    props.onClick?.(event);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <ContainedButtonComponent
        {...props}
        disabled={!options?.length || disabled}
        id="dropdown-button"
        aria-controls={isOpen ? 'dropdown-menu' : undefined}
        aria-haspopup="true"
        isLoading={isLoading}
        aria-expanded={isOpen ? 'true' : undefined}
        onClick={handleClick}>
        {children}
      </ContainedButtonComponent>

      {options?.length ? (
        <Menu
          id="dropdown-menu"
          anchorEl={anchorEl}
          open={isOpen}
          onClose={handleClose}
          MenuListProps={{ 'aria-labelledby': 'dropdown-button' }}>
          {options.map(option => {
            const isDangerOption = dangerOptionsRegExp.test(option as string);
            const isFriendlyOption = friendlyOptionsRegExp.test(option as string);
            const dangerColor = isDangerOption ? 'error.main' : null;
            const friendlyColor = isFriendlyOption ? 'success.main' : null;
            const isOptionDisabled = disabledOptions?.includes(option);

            const handleClick = () => {
              if (!onOptionClick || isOptionDisabled) return;

              onOptionClick(option);
              handleClose();
            };

            return (
              <MenuItem
                key={option}
                onClick={handleClick}
                disabled={!onOptionClick || disabled || isOptionDisabled}
                sx={{ color: dangerColor || friendlyColor || 'textPrimary.main' }}>
                {option}
              </MenuItem>
            );
          })}
        </Menu>
      ) : null}
    </Box>
  );
};
