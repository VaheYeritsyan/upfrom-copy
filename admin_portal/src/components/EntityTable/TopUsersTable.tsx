import React from 'react';
import { UserWithAttendance, UserWithAttending } from '~/types/eventUsers';
import { getUsersTableCellLink, getUsersTableCellValue, getUsersTableRowLink } from '~/util/table';
import { Props as TableProps, TableComponent } from '~/components/Table/TableComponent';
import { useUsersTableActions } from '~/hooks/useUsersTableActions';
import { ImageShape } from '~/types/image';

type Props<UserEntity extends UserWithAttendance> = Partial<
  Pick<TableProps<UserEntity, string>, 'cells' | 'rangeCells' | 'defaultOrderBy' | 'defaultOrder'>
> & {
  title?: string;
  imgCell?: keyof UserEntity;
  rows: UserEntity[];
  isLoading: boolean;
  count?: number;
};

type UserCells = (keyof UserWithAttendance)[];

const defaultCells: UserCells = [
  'id',
  'avatarUrl',
  'firstName',
  'lastName',
  'teams',
  'accepted',
  'pending',
  'declined',
  'total',
  'isDisabled',
];
const defaultRangeCells: UserCells = ['accepted', 'pending', 'declined', 'total', 'teams'];
const defaultImgCell: keyof UserWithAttendance = 'avatarUrl';

export const TopUsersTableComponent = <UserEntity extends UserWithAttendance>({
  title = 'Top Users',
  cells = defaultCells,
  rangeCells = defaultRangeCells,
  imgCell = defaultImgCell,
  rows,
  isLoading,
}: Props<UserEntity>) => {
  const { loadingIds, actions, disabledActions, modalsNode, handleActionClick } = useUsersTableActions();

  return (
    <>
      <TableComponent
        title={title}
        isLoading={isLoading}
        loadingIds={loadingIds}
        rows={rows}
        imgCell={imgCell as keyof UserWithAttending}
        imageShape={ImageShape.CIRCLE}
        defaultOrderBy="accepted"
        actions={actions}
        disabledActions={disabledActions}
        cells={cells as UserCells}
        rangeCells={rangeCells as UserCells}
        getRowLink={getUsersTableRowLink}
        getCellValue={getUsersTableCellValue}
        getCellLink={getUsersTableCellLink}
        onActionClick={handleActionClick}
      />

      {modalsNode}
    </>
  );
};
