import React from 'react';
import { Admin } from '@up-from/graphql-ap/genql';
import { getAdminsTableCellValue } from '~/util/table';
import { TableComponent, Props as TableProps } from '~/components/Table/TableComponent';
import { useAdminsTableActions } from '~/hooks/useAdminsTableActions';

type Props<AdminEntity extends Admin> = Partial<
  Pick<TableProps<AdminEntity, string>, 'cells' | 'defaultOrderBy' | 'defaultOrder'>
> & {
  title?: string;
  rows: AdminEntity[];
  isLoading: boolean;
};

type AdminCells = (keyof Admin)[];

const defaultCells: AdminCells = ['id', 'email', 'name', 'isDisabled', 'createdAt', 'updatedAt'];

export const AdminsTableComponent = <AdminEntity extends Admin>({
  title = 'Admins',
  cells = defaultCells,
  rows,
  isLoading,
}: Props<AdminEntity>) => {
  const { loadingIds, actions, disabledActions, modalsNode, handleActionClick, handleAddNewAdminClick } =
    useAdminsTableActions();

  return (
    <>
      <TableComponent
        title={title}
        loadingIds={loadingIds}
        disabledActions={disabledActions}
        isLoading={isLoading}
        actions={actions}
        cells={cells as AdminCells}
        rows={rows}
        onActionClick={handleActionClick}
        onAddClick={handleAddNewAdminClick}
        getCellValue={getAdminsTableCellValue}
      />

      {modalsNode}
    </>
  );
};
