import React from 'react';
import { User } from '@up-from/graphql-ap/genql';
import { ImageShape } from '~/types/image';
import { getUsersTableCellLink, getUsersTableCellValue, getUsersTableRowLink } from '~/util/table';
import { Props as TableProps, TableComponent } from '~/components/Table/TableComponent';
import { useUsersTableActions } from '~/hooks/useUsersTableActions';

type Props<UserEntity extends User> = Partial<
  Pick<TableProps<UserEntity, string>, 'cells' | 'defaultOrderBy' | 'defaultOrder' | 'rangeCells'>
> & {
  title?: string;
  imgCell?: keyof UserEntity;
  rows: UserEntity[];
  isLoading: boolean;
};

type UserCells = (keyof User)[];

const defaultCells: UserCells = [
  'id',
  'avatarUrl',
  'firstName',
  'lastName',
  'email',
  'phone',
  'teams',
  'birthday',
  'gender',
  'isDisabled',
  'createdAt',
];
const defaultRangeCells: UserCells = [];
const defaultImgCell: keyof User = 'avatarUrl';

export const UsersTableComponent = <UserEntity extends User>({
  title = 'Users',
  cells = defaultCells,
  imgCell = defaultImgCell,
  rangeCells = defaultRangeCells,
  rows,
  isLoading,
}: Props<UserEntity>) => {
  const { loadingIds, actions, disabledActions, modalsNode, handleActionClick, handleCreateUserClick } =
    useUsersTableActions();

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
        actions={actions}
        disabledActions={disabledActions}
        cells={cells as UserCells}
        getRowLink={getUsersTableRowLink}
        getCellValue={getUsersTableCellValue}
        getCellLink={getUsersTableCellLink}
        onActionClick={handleActionClick}
        onAddClick={handleCreateUserClick}
      />

      {modalsNode}
    </>
  );
};
