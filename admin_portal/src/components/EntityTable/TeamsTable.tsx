import React from 'react';
import { Team } from '@up-from/graphql-ap/genql';
import { ImageShape } from '~/types/image';
import { getTeamsTableCellLink, getTeamsTableCellValue, getTeamsTableRowLink } from '~/util/table';
import { Props as TableProps, TableComponent } from '~/components/Table/TableComponent';
import { useTeamsTableActions } from '~/hooks/useTeamsTableActions';

type Props<TeamEntity extends Team> = Partial<
  Pick<TableProps<TeamEntity, string>, 'cells' | 'rangeCells' | 'defaultOrderBy' | 'defaultOrder'>
> & {
  title?: string;
  imgCell?: keyof TeamEntity;
  rows: TeamEntity[];
  isLoading: boolean;
  organizationId?: string;
};

type TeamCells = (keyof Team)[];

const defaultCells: TeamCells = [
  'id',
  'imageUrl',
  'name',
  'organization',
  'members',
  'isDisabled',
  'createdAt',
  'updatedAt',
];
const defaultRangeCells: TeamCells = ['members'];
const defaultImgCell: keyof Team = 'imageUrl';

export const TeamsTableComponent = <TeamEntity extends Team>({
  title = 'Teams',
  cells = defaultCells,
  imgCell = defaultImgCell,
  rangeCells = defaultRangeCells,
  organizationId,
  rows,
  isLoading,
}: Props<TeamEntity>) => {
  const { modalsNode, loadingIds, actions, disabledActions, handleCreateTeamClick, handleActionClick } =
    useTeamsTableActions(rows, organizationId);

  return (
    <>
      <TableComponent
        title={title}
        isLoading={isLoading}
        rows={rows}
        imageShape={ImageShape.SQUARE}
        imgCell={imgCell as keyof Team}
        actions={actions}
        disabledActions={disabledActions}
        loadingIds={loadingIds}
        onAddClick={handleCreateTeamClick}
        cells={cells as TeamCells}
        rangeCells={rangeCells as TeamCells}
        getRowLink={getTeamsTableRowLink}
        getCellValue={getTeamsTableCellValue}
        getCellLink={getTeamsTableCellLink}
        onActionClick={handleActionClick}
      />

      {modalsNode}
    </>
  );
};
