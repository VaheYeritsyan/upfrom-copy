import React, { ChangeEvent, MouseEvent } from 'react';
import { visuallyHidden } from '@mui/utils';
import { Box, Checkbox, CircularProgress, TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { TableEntity, TableOrder } from '~/types/table';
import { getTitleFromKey } from '~/util/text';
import styles from '~/components/Table/table.module.scss';

type Props<Entity extends TableEntity> = {
  selectedCount: number;
  rowCount: number;
  isActionsHidden?: boolean;
  isLoading?: boolean;
  isIdCellVisible?: boolean;
  onRequestSort: (event: MouseEvent<unknown>, property: keyof Entity) => void;
  onSelectAllClick: (event: ChangeEvent<HTMLInputElement>) => void;
  order: TableOrder;
  orderBy?: keyof Entity | null;
  imgCell?: keyof Entity | null;
  cells: (keyof Entity)[];
};

export const TableHeadComponent = <Entity extends TableEntity>({
  cells,
  onSelectAllClick,
  order,
  orderBy,
  imgCell,
  isActionsHidden,
  isLoading,
  isIdCellVisible,
  selectedCount,
  rowCount,
  onRequestSort,
}: Props<Entity>) => {
  const createSortHandler = (property: keyof Entity) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {isActionsHidden ? null : (
          <TableCell padding="checkbox">
            {isLoading ? (
              <CircularProgress className={styles.tableLoadingCell} size={16} color="primary" />
            ) : (
              <Checkbox
                color="primary"
                indeterminate={selectedCount > 0 && selectedCount < rowCount}
                checked={rowCount > 0 && selectedCount === rowCount}
                onChange={onSelectAllClick}
                disabled={!rowCount}
                inputProps={{ 'aria-label': 'select all' }}
              />
            )}
          </TableCell>
        )}

        {imgCell ? <TableCell padding="checkbox" /> : null}

        {cells.map((cell, idx) => {
          if ((!isIdCellVisible && cell === 'id') || cell === imgCell) return null;
          const isOrderByCell = orderBy === cell;

          return (
            <TableCell
              key={`${cell as string}:${idx}`}
              align="left"
              padding="normal"
              sortDirection={isOrderByCell ? order : false}>
              <TableSortLabel
                active={isOrderByCell}
                direction={isOrderByCell ? order : TableOrder.ASC}
                onClick={createSortHandler(cell)}>
                {getTitleFromKey(cell)}

                {isOrderByCell ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === TableOrder.DESC ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};
