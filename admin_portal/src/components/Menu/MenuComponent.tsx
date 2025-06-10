import React, { FC, PropsWithChildren, useEffect } from 'react';
import { Tooltip, Paper, ClickAwayListener, PopperPlacementType, MenuList, Grow, Popper, Button } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { IconButtonComponent } from '~/components/Button/IconButtonComponent';

type Props = PropsWithChildren & {
  MenuIcon?: SvgIconComponent;
  text?: string;
  tooltipTitle?: string;
  isDisabled?: boolean;
  placement?: PopperPlacementType;
};

export const MenuComponent: FC<Props> = ({
  MenuIcon,
  text,
  isDisabled,
  tooltipTitle,
  placement = 'bottom-start',
  children,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [text]);

  const handleToggle = () => {
    setIsOpen(prevOpen => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) return;

    setIsOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setIsOpen(false);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div>
      {MenuIcon ? (
        <IconButtonComponent
          tooltipTitle={tooltipTitle}
          ref={anchorRef}
          disabled={isDisabled}
          color={isOpen ? 'primary' : 'inherit'}
          id="composition-button"
          aria-controls={isOpen ? 'composition-menu' : undefined}
          aria-expanded={isOpen ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}>
          <MenuIcon />
        </IconButtonComponent>
      ) : null}

      {text ? (
        <Tooltip title={tooltipTitle}>
          <Button
            ref={anchorRef}
            size="small"
            disabled={isDisabled}
            color={isOpen ? 'primary' : 'inherit'}
            id="composition-button"
            aria-controls={isOpen ? 'composition-menu' : undefined}
            aria-expanded={isOpen ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}>
            {text}
          </Button>
        </Tooltip>
      ) : null}

      <Popper open={isOpen} anchorEl={anchorRef.current} sx={{ zIndex: 1 }} placement={placement} transition>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
            }}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={isOpen}
                  id="composition-menu"
                  aria-labelledby="composition-button"
                  onKeyDown={handleListKeyDown}>
                  {children}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
};
