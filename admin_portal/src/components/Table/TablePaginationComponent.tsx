import React, { FC } from 'react';
import { TablePagination, TablePaginationProps } from '@mui/material';
import { TableRowsSize } from '~/types/table';

const rowsPerPageOptionsDefault = [TableRowsSize.SHORT, TableRowsSize.MEDIUM, TableRowsSize.LONG];

type Props = Omit<TablePaginationProps, 'rowsPerPageOptions'> & {
  rowsPerPageOptions?: TableRowsSize[];
};

export const TablePaginationComponent: FC<Props> = ({ rowsPerPageOptions = rowsPerPageOptionsDefault, ...props }) => {
  return <TablePagination rowsPerPageOptions={rowsPerPageOptions} component="div" {...props} />;
};
