import React, { useMemo } from 'react';
import { Team } from '@up-from/graphql-ap/genql';
import { ImageShape } from '~/types/image';
import { getTeamsTableCellLink, getTeamsTableRowLink, getUserTeamsTableCellValue } from '~/util/table';
import { Props as TableProps, TableComponent } from '~/components/Table/TableComponent';
import { useTeamsTableActions } from '~/hooks/useTeamsTableActions';
import { useAddTeamToUser } from '~/hooks/useAddTeamToUser';

type UserTeam = Team & { role?: string };

type Props<TeamEntity extends UserTeam> = Partial<
  Pick<TableProps<TeamEntity, string>, 'cells' | 'rangeCells' | 'defaultOrderBy' | 'defaultOrder'>
> & {
  title?: string;
  imgCell?: keyof TeamEntity;
  rows: TeamEntity[];
  isLoading: boolean;
  userId: string;
};

type TeamCells = (keyof UserTeam)[];

const defaultCells: TeamCells = ['id', 'imageUrl', 'name', 'role', 'members', 'isDisabled', 'createdAt', 'updatedAt'];
const defaultRangeCells: TeamCells = ['members'];
const defaultImgCell: keyof Team = 'imageUrl';

export const UserTeamsTableComponent = <TeamEntity extends UserTeam>({
  title = 'Teams',
  cells = defaultCells,
  imgCell = defaultImgCell,
  rangeCells = defaultRangeCells,
  userId,
  rows,
  isLoading,
}: Props<TeamEntity>) => {
  const { modalsNode, loadingIds, actions, disabledActions, handleCreateTeamClick, handleActionClick } =
    useTeamsTableActions(rows);

  const teamsToUser = useAddTeamToUser(userId, rows);

  const getCellValue = useMemo(() => getUserTeamsTableCellValue(userId), [userId]);

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
        getCellValue={getCellValue}
        getCellLink={getTeamsTableCellLink}
        onActionClick={handleActionClick}
        onAddExistingClick={teamsToUser.handleAddMemberClick}
      />

      {modalsNode}
      {teamsToUser.modalsNode}
    </>
  );
};
