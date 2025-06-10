import React, { PropsWithChildren } from 'react';
import clsx from 'clsx';
import { Toolbar, Typography, Tooltip, Box } from '@mui/material';
import { FilterList, Add, ExitToApp } from '@mui/icons-material';
import { DropdownButton, Props as DropdownButtonProps } from '~/components/Button/DropdownButton';
import { IconButtonComponent } from '~/components/Button/IconButtonComponent';
import styles from './table-toolbar.module.scss';

export type Props<Action extends string> = PropsWithChildren & {
  title: string;
  selectedCount: number;
  isActionsHidden?: boolean;
  isLoading?: boolean;
  actions?: DropdownButtonProps<Action>['options'];
  disabledActions?: DropdownButtonProps<Action>['disabledOptions'];
  onActionClick?: DropdownButtonProps<Action>['onOptionClick'];
  onFilterClick?: () => void;
  onAddClick?: () => void;
  onAddExistingClick?: () => void;
};

export const TableToolbarComponent = <Action extends string>({
  children,
  actions,
  disabledActions,
  title,
  isLoading,
  isActionsHidden,
  selectedCount,
  onActionClick,
  onFilterClick,
  onAddClick,
  onAddExistingClick,
}: Props<Action>) => (
  <Toolbar className={clsx(styles.tableToolbar, !!selectedCount && styles.tableToolbarSelected)}>
    <Box className={styles.tableToolbarContent}>
      {selectedCount > 0 ? (
        <Typography color="inherit" variant="subtitle1" component="div">
          {selectedCount} selected
        </Typography>
      ) : (
        <Typography variant="h6" id="tableTitle" component="div">
          {title}
        </Typography>
      )}

      {selectedCount > 0 ? (
        <DropdownButton
          className={styles.tableToolbarActionButton}
          variant="contained"
          color="primary"
          options={actions}
          disabledOptions={disabledActions}
          size="small"
          isLoading={isLoading}
          onOptionClick={onActionClick}>
          Select Action
        </DropdownButton>
      ) : (
        <>
          {onFilterClick && !isActionsHidden ? (
            <Box className={styles.tableToolbarActionButtons}>
              {onAddExistingClick ? (
                <Tooltip title="Add existing" color="inherit">
                  <IconButtonComponent onClick={onAddExistingClick} disabled={isLoading}>
                    <ExitToApp />
                  </IconButtonComponent>
                </Tooltip>
              ) : null}
              {onAddClick ? (
                <Tooltip title="Add new" color="inherit">
                  <IconButtonComponent onClick={onAddClick} disabled={isLoading}>
                    <Add />
                  </IconButtonComponent>
                </Tooltip>
              ) : null}
              <Tooltip title="Filter list">
                <IconButtonComponent
                  onClick={onFilterClick}
                  color={children ? 'primary' : 'inherit'}
                  disabled={isLoading}>
                  <FilterList />
                </IconButtonComponent>
              </Tooltip>
            </Box>
          ) : null}
        </>
      )}
    </Box>

    {children ? <Box className={styles.tableToolbarFilters}>{children}</Box> : null}
  </Toolbar>
);
