import React from 'react';
import { Event } from '@up-from/graphql-ap/genql/index';
import { TableOrder } from '~/types/table';
import { ImageShape } from '~/types/image';
import { getEventsTableCellLink, getEventsTableCellValue, getEventsTableRowLink } from '~/util/table';
import { TableComponent, Props as TableProps } from '~/components/Table/TableComponent';
import { useEventsTableActions } from '~/hooks/useEventsTableActions';

type Props<EventEntity extends Event> = Partial<
  Pick<TableProps<EventEntity, string>, 'cells' | 'rangeCells' | 'defaultOrderBy' | 'defaultOrder'>
> & {
  title?: string;
  imgCell?: keyof EventEntity;
  rows: EventEntity[];
  isLoading: boolean;
  isAddingNewDisabled?: boolean;
};

type EventCells = (keyof Event)[];

const defaultCells: EventCells = [
  'id',
  'imageUrl',
  'title',
  'guests',
  'isIndividual',
  'startsAt',
  'endsAt',
  'team',
  'owner',
  'location',
  'address',
  'isCancelled',
  'createdAt',
];
const defaultRangeCells: EventCells = ['guests'];
const defaultImgCell: keyof Event = 'imageUrl';

export const EventsTableComponent = <EventEntity extends Event>({
  title = 'Events',
  cells = defaultCells,
  rangeCells = defaultRangeCells,
  imgCell = defaultImgCell,
  rows,
  isLoading,
  isAddingNewDisabled,
}: Props<EventEntity>) => {
  const { loadingIds, actions, disabledActions, confirmationModalsNode, handleActionClick, handleCreateEventClick } =
    useEventsTableActions();

  return (
    <>
      <TableComponent
        title={title}
        isLoading={isLoading}
        loadingIds={loadingIds}
        rows={rows}
        actions={actions}
        disabledActions={disabledActions}
        imgCell={imgCell as keyof Event}
        imageShape={ImageShape.SQUARE}
        defaultOrderBy="startsAt"
        defaultOrder={TableOrder.ASC}
        cells={cells as EventCells}
        rangeCells={rangeCells as EventCells}
        getRowLink={getEventsTableRowLink}
        getCellLink={getEventsTableCellLink}
        getCellValue={getEventsTableCellValue}
        onActionClick={handleActionClick}
        onAddClick={isAddingNewDisabled ? undefined : handleCreateEventClick}
      />

      {confirmationModalsNode}
    </>
  );
};
