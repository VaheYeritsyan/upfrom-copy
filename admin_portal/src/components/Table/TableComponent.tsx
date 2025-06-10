import React, { useState, MouseEvent, ChangeEvent, useEffect, useMemo, PropsWithChildren, useRef } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow as MuiTableRow,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { ImageShape } from '~/types/image';
import { getFullDate, getFullDateAndTime, isBirthdayKey, isDateKey } from '~/util/date';
import { getTitleFromKey } from '~/util/text';
import { exportCsv } from '~/util/csv';
import { getComparator, getCsvContent, getRawTableRow, searchTable, sortTable } from '~/util/table';
import { DisabledActions, FormattedTableRow, TableEntity, TableOrder, TableRow, TableRowsSize } from '~/types/table';
import { TableToolbarComponent, Props as TableToolbarProps } from '~/components/Table/TableToolbarComponent';
import { TableHeadComponent } from '~/components/Table/TableHeadComponent';
import { TablePaginationComponent } from '~/components/Table/TablePaginationComponent';
import { AutocompleteInputComponent } from '~/components/Input/AutocompleteInputComponent';
import { InputComponent } from '~/components/Input/InputComponent';
import { TableCellImgComponent } from '~/components/Table/TableCellImgComponent';
import { DateInputComponent } from '~/components/Input/DateInputComponent';
import styles from './table.module.scss';

enum TableActions {
  EXPORT = 'Export (.csv)',
}

type FilterFormValues = {
  searchBy: { label: string; value: string } | null;
  searchFor: string | [string | Date, string | Date];
};

export type Props<Entity extends TableEntity, Action extends string> = Pick<
  TableToolbarProps<Action>,
  'actions' | 'title' | 'isActionsHidden' | 'onAddClick' | 'onAddExistingClick'
> &
  PropsWithChildren & {
    className?: string;
    rows: TableRow<Entity>[];
    loadingIds?: Entity['id'][];
    cells: (keyof Entity)[];
    rangeCells?: (keyof Entity)[];
    imgCell?: keyof Entity;
    imageShape?: ImageShape;
    isLoading?: boolean;
    isIdCellVisible?: boolean;
    defaultOrderBy?: keyof Entity;
    defaultOrder?: TableOrder;
    defaultRowsPerPage?: TableRowsSize;
    getCellLink?: (cellKey: keyof Entity, row: FormattedTableRow<Entity>) => string | null;
    getRowLink?: (row: Entity) => string | null;
    onFiltersReset?: () => void;
    disabledActions?: DisabledActions<Action, Entity>;
    getCellValue?: <EntityKey extends keyof Entity>(
      cellKey: EntityKey,
      entity: Entity,
    ) => FormattedTableRow<Entity>[keyof Entity] | null;
    onActionClick?: (action: Action, selectedIds: Entity['id'][]) => void | Promise<void>;
  };

const tableMuiHeadHeight = 57.68;

export const TableComponent = <Entity extends TableEntity, Action extends string>({
  className,
  imageShape,
  cells,
  rangeCells,
  imgCell,
  rows: tableRows,
  defaultOrderBy: tableDefaultOrderBy,
  isActionsHidden,
  defaultRowsPerPage = TableRowsSize.SHORT,
  defaultOrder = TableOrder.DESC,
  isLoading,
  getCellLink,
  getRowLink,
  isIdCellVisible,
  loadingIds,
  getCellValue,
  children,
  onFiltersReset,
  onActionClick,
  onAddClick,
  onAddExistingClick,
  actions,
  title,
  disabledActions,
}: Props<Entity, Action>) => {
  const tableRowRef = useRef<HTMLAnchorElement>(null);

  const defaultOrderBy = useMemo(() => {
    if (tableDefaultOrderBy) return tableDefaultOrderBy;

    return cells.includes('createdAt') ? 'createdAt' : null;
  }, []);

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [order, setOrder] = useState(defaultOrder);
  const [orderBy, setOrderBy] = useState<keyof Entity | null>(defaultOrderBy);
  const [selected, setSelected] = useState<(keyof Entity['id'])[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const { control, watch, reset, setValue } = useForm<FilterFormValues>();
  const [searchBy, searchFor] = watch(['searchBy', 'searchFor']);
  const searchRange = watch(['searchFor.0', 'searchFor.1']);

  const cellsWithoutImg = useMemo(() => {
    return cells.filter(cell => cell !== imgCell);
  }, [cells, imgCell]);

  const isSearchByRange = useMemo(() => {
    if (!searchBy?.value || !rangeCells?.length) return false;

    return rangeCells.includes(searchBy.value);
  }, [searchBy, rangeCells]);

  const isSearchByDateRange = useMemo(() => {
    if (!searchBy?.value) return false;

    return isDateKey(searchBy.value) || isBirthdayKey(searchBy.value);
  }, [searchBy, rangeCells]);

  useEffect(() => {
    if (isSearchByRange || isSearchByDateRange) {
      setValue('searchFor.0', '');
      setValue('searchFor.1', '');
    } else {
      setValue('searchFor', '');
    }
  }, [isSearchByRange || isSearchByDateRange]);

  const searchForValue = useMemo(() => {
    if (isSearchByRange || isSearchByDateRange) return searchRange;

    return searchFor;
  }, [isSearchByRange, isSearchByDateRange, searchFor, searchRange]);

  const rows = useMemo(() => {
    if (!cellsWithoutImg.length) return [];

    const filteredRows = searchTable(tableRows, searchBy?.value, searchForValue, getCellValue);

    return filteredRows.map(row => {
      return Object.fromEntries(
        cells.map(cell => {
          const customCellValue = getCellValue?.(cell, row);
          if (customCellValue) return [cell, customCellValue];
          if (!row[cell] && typeof row[cell] !== 'boolean') return [cell, { label: '-', value: row[cell] }];

          const date = new Date(row[cell]);
          if (isDateKey(cell.toString())) return [cell, { label: getFullDateAndTime(date), value: date.getTime() }];
          if (isBirthdayKey(cell.toString())) return [cell, { label: getFullDate(date), value: date.getTime() }];

          const isValueArray = Array.isArray(row[cell]);
          const rowValue = isValueArray ? row[cell].length : row[cell];

          return [cell, { label: rowValue?.toString() ?? '-', value: rowValue }];
        }),
      ) as FormattedTableRow<Entity>;
    });
  }, [tableRows, cells, searchBy?.value, searchForValue, getCellValue]);

  const searchByOptions = useMemo(() => {
    return cellsWithoutImg.map(value => ({ label: getTitleFromKey(value), value: value.toString() }));
  }, [cellsWithoutImg]);

  const tableActions = [TableActions.EXPORT, ...(actions || [])];

  const disabledTableActions = useMemo(() => {
    if (!rows.length || !selected.length || !disabledActions) return [];

    const actions = [] as Action[];

    const selectedRows = rows.filter(({ id }) => selected.includes(id.value));

    for (const [action, target] of Object.entries(disabledActions)) {
      const targetEntries = Object.entries(target as Record<keyof Entity, Entity[keyof Entity]>);

      const isActionDisabled = selectedRows.some(row => {
        return targetEntries.every(([key, value]) => row[key].value === value);
      });

      if (isActionDisabled) actions.push(action as Action);
    }

    return actions;
  }, [selected, rows, disabledActions]);

  useEffect(() => {
    setPage(0);
  }, [rowsPerPage]);

  useEffect(() => {
    const rowIds = rows.map(({ id }) => id.value);

    setSelected(prevSelected => prevSelected.filter(id => rowIds.includes(id as string)));
  }, [rows.length]);

  const handleRequestSort = (event: MouseEvent<unknown>, property: keyof Entity) => {
    const isAsc = orderBy === property && order === TableOrder.ASC;

    setOrder(isAsc ? TableOrder.DESC : TableOrder.ASC);
    setOrderBy(property);
  };

  const handleSelectAllClick = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setSelected(target.checked ? rows.map(({ id }) => id.value) : []);
  };

  const stopPropagation = (event: MouseEvent<unknown>) => {
    event.stopPropagation();
  };

  const handleCheckboxClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const name = event.currentTarget.querySelector('input')?.name;
    if (!name) return;

    setSelected(prevSelected => {
      const isSelected = prevSelected.includes(name);

      return isSelected ? prevSelected.filter(item => item !== name) : [...prevSelected, name];
    });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(target.value, 10));
  };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const sortedRows = useMemo(() => {
    return sortTable(rows, getComparator(order, orderBy));
  }, [order, orderBy, rows]);

  const visibleRows = useMemo(() => {
    return sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedRows, page, rowsPerPage]);

  const handleFiltersReset = () => {
    onFiltersReset?.();
    reset({ searchBy: null, searchFor: '' });
  };

  const handleFilterClick = () => {
    setIsFilterVisible(prevState => {
      if (prevState) handleFiltersReset();

      return !prevState;
    });
  };

  const handleActionClick = async (action: Action | TableActions) => {
    if (action === TableActions.EXPORT) {
      const rowsToExport = sortedRows.filter(({ id }) => selected.includes(id.value));

      const csvContent = getCsvContent(rowsToExport.map(getRawTableRow), orderBy, order);
      exportCsv(csvContent, `${title}-table`);
      return;
    }

    await onActionClick?.(action, selected);
  };

  const searchRangeNode = isSearchByRange ? (
    <>
      <InputComponent
        control={control}
        disabled={!!selected.length}
        variant="outlined"
        size="small"
        type="number"
        name="searchFor.0"
        label="Min Value"
      />
      <InputComponent
        control={control}
        disabled={!!selected.length}
        variant="outlined"
        size="small"
        type="number"
        name="searchFor.1"
        label="Max Value"
      />
    </>
  ) : null;

  const searchDateRangeNode = isSearchByDateRange ? (
    <>
      <DateInputComponent
        control={control}
        disabled={!!selected.length}
        variant="outlined"
        size="small"
        type="number"
        isStartDate
        name="searchFor.0"
        label="Start Date"
      />
      <DateInputComponent
        control={control}
        disabled={!!selected.length}
        variant="outlined"
        size="small"
        type="number"
        isEndDate
        name="searchFor.1"
        label="End Date"
      />
    </>
  ) : null;

  return (
    <Paper className={clsx(styles.tablePaper, className)}>
      <TableToolbarComponent
        actions={tableActions}
        title={title}
        isLoading={!!loadingIds?.length}
        isActionsHidden={isActionsHidden}
        disabledActions={disabledTableActions}
        onActionClick={handleActionClick}
        onAddClick={onAddClick}
        onAddExistingClick={onAddExistingClick}
        selectedCount={selected.length}
        onFilterClick={handleFilterClick}>
        {isFilterVisible ? (
          <form>
            <AutocompleteInputComponent
              control={control}
              variant="outlined"
              size="small"
              name="searchBy"
              label="Search By"
              disabled={!!selected.length}
              options={searchByOptions}
            />
            {isSearchByRange || isSearchByDateRange ? (
              <>
                {searchRangeNode}
                {searchDateRangeNode}
              </>
            ) : (
              <InputComponent
                control={control}
                disabled={!!selected.length}
                variant="outlined"
                size="small"
                name="searchFor"
                label="Search For"
              />
            )}

            {children ? (
              <>
                <Divider orientation="vertical" />
                {children}
              </>
            ) : null}

            <Button size="small" color="inherit" disabled={!!selected.length} onClick={handleFiltersReset}>
              Reset
            </Button>
          </form>
        ) : null}
      </TableToolbarComponent>

      <TableContainer>
        <Table aria-labelledby="tableTitle" size="medium">
          <TableHeadComponent
            isActionsHidden={isActionsHidden}
            isIdCellVisible={isIdCellVisible}
            selectedCount={selected.length}
            order={order}
            isLoading={!!loadingIds?.length}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
            imgCell={imgCell}
            cells={cells}
          />

          <TableBody>
            {visibleRows.map((row, index) => {
              const isItemSelected = isSelected(row.id.value);
              const isItemLoading = loadingIds?.includes(row.id.value);
              const labelId = `${title}-table-checkbox-${index}`;
              const link = getRowLink?.(getRawTableRow(row));

              return (
                <MuiTableRow
                  className={clsx(styles.tableRow, link && styles.tableRowLink)}
                  ref={tableRowRef}
                  component={link ? 'a' : 'tr'}
                  aria-roledescription="tr"
                  href={link || ''}
                  target="_blank"
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.id.value}
                  selected={isItemSelected}>
                  {isActionsHidden ? null : (
                    <TableCell padding="checkbox">
                      {isItemLoading ? (
                        <CircularProgress className={styles.tableLoadingCell} size={16} color="primary" />
                      ) : (
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onClick={handleCheckboxClick}
                          name={row.id.value}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      )}
                    </TableCell>
                  )}

                  {cells.map(key => {
                    if (!isIdCellVisible && key === 'id') return null;

                    const rowCellValue = row[key];
                    const link = getCellLink?.(key, row);
                    const isMultiLink = Array.isArray(link);
                    const text = typeof rowCellValue?.label === 'object' ? '[Object]' : rowCellValue?.label;
                    const isImage = key === imgCell;

                    return (
                      <TableCell key={`${row.id.value}:${key as string}`} padding={isImage ? 'checkbox' : 'normal'}>
                        {isImage ? (
                          <TableCellImgComponent src={rowCellValue.value} imageShape={imageShape} />
                        ) : (
                          <>
                            {link ? (
                              <>
                                {isMultiLink ? (
                                  text?.split(', ').map((linkText, idx) => (
                                    <>
                                      <Link
                                        className={styles.tableCellLink}
                                        key={link[idx]}
                                        href={link[idx] || ''}
                                        onClick={stopPropagation}>
                                        {linkText}
                                      </Link>
                                      {link.length > 1 ? <>,&nbsp;</> : null}
                                    </>
                                  ))
                                ) : (
                                  <Link className={styles.tableCellLink} href={link} onClick={stopPropagation}>
                                    {text}
                                  </Link>
                                )}
                              </>
                            ) : (
                              text
                            )}
                          </>
                        )}
                      </TableCell>
                    );
                  })}
                </MuiTableRow>
              );
            })}

            {emptyRows > 0 && (
              <MuiTableRow style={{ height: (tableRowRef.current?.clientHeight || tableMuiHeadHeight) * emptyRows }}>
                <TableCell colSpan={cells.length + (isActionsHidden ? 0 : 1)} />
              </MuiTableRow>
            )}

            {rows.length ? null : (
              <MuiTableRow style={{ height: tableMuiHeadHeight }}>
                <TableCell colSpan={cells.length + (isActionsHidden ? 0 : 1)} align="center">
                  {isLoading ? 'Loading...' : 'No Data'}
                </TableCell>
              </MuiTableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePaginationComponent
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};
