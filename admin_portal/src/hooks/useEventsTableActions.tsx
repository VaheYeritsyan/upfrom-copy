import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { Event } from '@up-from/graphql-ap/genql';
import { ConfirmationModalComponent } from '~/components/Modal/ConfirmationModalComponent';
import { useEventMutations, CreateEventArgs } from '~/api/useEventsMutations';
import { CreateEventModalComponent } from '~/components/CreateEvent/CreateEventModalComponent';
import { useAllUsersQuery } from '~/api/useAllUsersQuery';
import { useAllTeamsQuery } from '~/api/useAllTeamsQuery';
import { DisabledActions } from '~/types/table';

enum EventActions {
  RESTORE = 'Restore',
  CANCEL = 'Cancel',
}

const actions = Object.values(EventActions);
const disabledActions: DisabledActions<EventActions, Event> = {
  [EventActions.RESTORE]: { isCancelled: false },
  [EventActions.CANCEL]: { isCancelled: true },
};

export const useEventsTableActions = () => {
  const [isCreateEventModalVisible, setCreateEventModalVisible] = useState(false);
  const [idsToCancel, setIdsToCancel] = useState<string[]>([]);
  const [idsToRestore, setIdsToRestore] = useState<string[]>([]);

  const { createEvent, cancelEvent, restoreEvent, loadingIds } = useEventMutations();
  const usersData = useAllUsersQuery();
  const teamsData = useAllTeamsQuery();

  const handleActionClick = (action: EventActions, ids: string[]) => {
    switch (action) {
      case EventActions.CANCEL:
        setIdsToCancel(ids);
        return;
      case EventActions.RESTORE:
        setIdsToRestore(ids);
        return;

      default:
        return;
    }
  };

  const handleConfirmRestoreActionClick = async () => {
    await restoreEvent.restoreAll(idsToRestore);
    setIdsToRestore([]);
  };

  const handleCloseRestoreConfirmationModal = async () => {
    setIdsToRestore([]);
  };

  const handleConfirmCancelActionClick = async () => {
    await cancelEvent.cancelAll(idsToCancel);
    setIdsToCancel([]);
  };

  const handleCloseCancelConfirmationModal = async () => {
    setIdsToCancel([]);
  };

  const handleCreateEventClick = () => {
    setCreateEventModalVisible(true);
  };

  const handleCreateEventModalClose = () => {
    setCreateEventModalVisible(false);
  };

  const createNewEvent = async (formValues: CreateEventArgs) => {
    await createEvent.create(formValues, () => {
      setCreateEventModalVisible(false);
    });
  };

  const confirmationModalsNode = (
    <>
      <CreateEventModalComponent
        isOpen={isCreateEventModalVisible}
        isLoading={createEvent.fetching}
        onSubmit={createNewEvent}
        teams={teamsData.teams}
        users={usersData.users}
        isTeamsLoading={teamsData.fetching}
        isUsersLoading={usersData.fetching}
        onClose={handleCreateEventModalClose}
      />

      <ConfirmationModalComponent
        isOpen={!!idsToCancel.length}
        actionText="Cancel"
        isLoading={cancelEvent.fetching}
        onActionClick={handleConfirmCancelActionClick}
        onClose={handleCloseCancelConfirmationModal}>
        <Typography variant="body1">Are you sure you want to cancel all the selected events?</Typography>
        <Typography variant="body1">
          Selected events: <strong>{idsToCancel.length}</strong>
        </Typography>
        <Typography variant="subtitle2">
          By canceling, all the selected users related data will be canceled and not visible in the app.
        </Typography>
      </ConfirmationModalComponent>

      <ConfirmationModalComponent
        isOpen={!!idsToRestore.length}
        actionText="Restore"
        buttonColor="success"
        isLoading={restoreEvent.fetching}
        onActionClick={handleConfirmRestoreActionClick}
        onClose={handleCloseRestoreConfirmationModal}>
        <Typography variant="body1">Are you sure you want to restore all the selected events?</Typography>
        <Typography variant="body1">
          Selected events: <strong>{idsToRestore.length}</strong>
        </Typography>
        <Typography variant="subtitle2">
          By restoring, all the selected events related data will be restored.
        </Typography>
      </ConfirmationModalComponent>
    </>
  );

  return {
    actions,
    disabledActions,
    loadingIds,
    confirmationModalsNode,
    handleActionClick,
    handleCreateEventClick,
  };
};
