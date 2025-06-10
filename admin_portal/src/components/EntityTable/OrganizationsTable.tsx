import React from 'react';
import { Organization } from '@up-from/graphql-ap/genql';
import {
  getOrganizationsTableCellLink,
  getOrganizationsTableCellValue,
  getOrganizationsTableRowLink,
} from '~/util/table';
import { Props as TableProps, TableComponent } from '~/components/Table/TableComponent';
import { useOrganizationsTableActions } from '~/hooks/useOrganizationsTableActions';

type Props<OrganizationEntity extends Organization> = Partial<
  Pick<TableProps<OrganizationEntity, string>, 'cells' | 'rangeCells' | 'defaultOrderBy' | 'defaultOrder'>
> & {
  title?: string;
  rows: OrganizationEntity[];
  isLoading: boolean;
};

type OrganizationCells = (keyof Organization)[];

const defaultCells: OrganizationCells = ['id', 'name', 'teams', 'createdAt', 'updatedAt'];
const defaultRangeCells: OrganizationCells = ['teams'];

export const OrganizationsTableComponent = <OrganizationEntity extends Organization>({
  title = 'Organizations',
  cells = defaultCells,
  rangeCells = defaultRangeCells,
  rows,
  isLoading,
}: Props<OrganizationEntity>) => {
  const { modalsNode, loadingIds, actions, handleCreateOrganizationClick, handleActionClick } =
    useOrganizationsTableActions();

  return (
    <>
      <TableComponent
        title={title}
        isLoading={isLoading}
        rows={rows}
        actions={actions}
        loadingIds={loadingIds}
        onAddClick={handleCreateOrganizationClick}
        cells={cells as OrganizationCells}
        rangeCells={rangeCells as OrganizationCells}
        getRowLink={getOrganizationsTableRowLink}
        getCellValue={getOrganizationsTableCellValue}
        getCellLink={getOrganizationsTableCellLink}
        onActionClick={handleActionClick}
      />

      {modalsNode}
    </>
  );
};
