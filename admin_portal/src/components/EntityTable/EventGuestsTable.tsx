import React from 'react';
import { ImageShape } from '~/types/image';
import { getUsersTableCellLink, getUsersTableCellValue, getUsersTableRowLink } from '~/util/table';
import { TableComponent, Props as TableProps } from '~/components/Table/TableComponent';
import { UserWithAttending } from '~/types/eventUsers';
import { useEventGuestsTableActions } from '~/hooks/useEventGuestsTableActions';

type Props<UserEntity extends UserWithAttending> = Partial<
  Pick<TableProps<UserEntity, string>, 'cells' | 'defaultOrderBy' | 'defaultOrder' | 'rangeCells'>
> & {
  title?: string;
  imgCell?: keyof UserEntity;
  rows: UserEntity[];
  eventId?: string;
  isLoading: boolean;
};

type UserCells = (keyof UserWithAttending)[];

const defaultCells: UserCells = [
  'id',
  'avatarUrl',
  'firstName',
  'lastName',
  'isAttending',
  'teams',
  'gender',
  'birthday',
  'isDisabled',
  'createdAt',
];
const defaultRangeCells: UserCells = ['teams'];
const defaultImgCell: keyof UserWithAttending = 'avatarUrl';

export const EventGuestsTableComponent = <UserEntity extends UserWithAttending>({
  title = 'Guests',
  cells = defaultCells,
  imgCell = defaultImgCell,
  rangeCells = defaultRangeCells,
  rows,
  eventId,
  isLoading,
}: Props<UserEntity>) => {
  const { loadingIds, actions, disabledActions, modalsNode, handleActionClick } = useEventGuestsTableActions(eventId);

  return (
    <>
      <TableComponent
        title={title}
        isLoading={isLoading}
        loadingIds={loadingIds}
        rows={rows}
        rangeCells={rangeCells as UserCells}
        imageShape={ImageShape.CIRCLE}
        imgCell={imgCell as keyof UserWithAttending}
        actions={actions}
        disabledActions={disabledActions}
        cells={cells as UserCells}
        getRowLink={getUsersTableRowLink}
        getCellValue={getUsersTableCellValue}
        getCellLink={getUsersTableCellLink}
        onActionClick={handleActionClick}
      />

      {modalsNode}
    </>
  );
};
