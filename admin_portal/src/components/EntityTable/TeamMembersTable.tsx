import React from 'react';
import { TeamUser, User } from '@up-from/graphql-ap/genql';
import { ImageShape } from '~/types/image';
import { getTeamUsersTableCellLink, getTeamUsersTableCellValue, getTeamUsersTableRowLink } from '~/util/table';
import { Props as TableProps, TableComponent } from '~/components/Table/TableComponent';
import { useTeamMembersTableActions } from '~/hooks/useTeamMembersTableActions';
import { useAddMemberToTeam } from '~/hooks/useAddMemberToTeam';

export type TeamMember = User & Pick<TeamUser, 'role'>;

type Props<UserEntity extends TeamMember> = Partial<
  Pick<TableProps<UserEntity, string>, 'cells' | 'defaultOrderBy' | 'defaultOrder' | 'rangeCells'>
> & {
  title?: string;
  imgCell?: keyof UserEntity;
  rows: UserEntity[];
  teamId?: string;
  isLoading: boolean;
};

type UserCells = (keyof TeamMember)[];

const defaultCells: UserCells = [
  'id',
  'avatarUrl',
  'firstName',
  'lastName',
  'role',
  'email',
  'phone',
  'teams',
  'birthday',
  'gender',
  'isDisabled',
  'createdAt',
];
const defaultRangeCells: UserCells = [];
const defaultImgCell: keyof TeamMember = 'avatarUrl';

export const TeamMembersTableComponent = <UserEntity extends TeamMember>({
  title = 'Members',
  cells = defaultCells,
  imgCell = defaultImgCell,
  rangeCells = defaultRangeCells,
  rows,
  teamId,
  isLoading,
}: Props<UserEntity>) => {
  const { modalsNode, handleCreateUserClick, handleActionClick, actions, disabledActions, loadingIds } =
    useTeamMembersTableActions(teamId);

  const memberToTeam = useAddMemberToTeam(teamId, rows);

  return (
    <>
      <TableComponent
        title={title}
        isLoading={isLoading}
        loadingIds={loadingIds}
        rows={rows}
        rangeCells={rangeCells as UserCells}
        imgCell={imgCell as keyof User}
        imageShape={ImageShape.CIRCLE}
        actions={actions as []}
        disabledActions={disabledActions}
        cells={cells as UserCells}
        getRowLink={getTeamUsersTableRowLink}
        getCellValue={getTeamUsersTableCellValue}
        getCellLink={getTeamUsersTableCellLink}
        onAddClick={handleCreateUserClick}
        onAddExistingClick={memberToTeam.handleAddMemberClick}
        onActionClick={handleActionClick}
      />

      {modalsNode}
      {memberToTeam.modalsNode}
    </>
  );
};
