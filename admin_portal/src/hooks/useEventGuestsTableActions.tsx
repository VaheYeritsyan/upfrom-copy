import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import { ConfirmationModalComponent } from '~/components/Modal/ConfirmationModalComponent';
import { useEventGuestMutations } from '~/api/useEventGuestsMutations';
import { ActionModalComponent } from '~/components/Modal/ActionModalComponent';
import { AutocompleteInputComponent } from '~/components/Input/AutocompleteInputComponent';
import { useUserMutations } from '~/api/useUsersMutations';
import { DisabledActions } from '~/types/table';
import { UserWithAttending } from '~/types/eventUsers';

type FormValues = {
  isAttending: { label: string; value: string };
};

enum EventGuestActions {
  UPDATE = 'Update (guest)',
  ENABLE = 'Enable (user)',
  DISABLE = 'Disable (user)',
}

const actions = Object.values(EventGuestActions);
const disabledActions: DisabledActions<EventGuestActions, UserWithAttending> = {
  [EventGuestActions.ENABLE]: { isDisabled: false },
  [EventGuestActions.DISABLE]: { isDisabled: true },
  [EventGuestActions.UPDATE]: { isDisabled: true },
};

const options = [
  {
    label: 'Pending',
    value: 'pending',
  },
  {
    label: 'Accepted',
    value: 'accepted',
  },
  {
    label: 'Declined',
    value: 'declined',
  },
];

const attendingOptionValues = {
  pending: null,
  accepted: true,
  declined: false,
};

export const useEventGuestsTableActions = (eventId?: string) => {
  const [idsToDisable, setIdsToDisable] = useState<string[]>([]);
  const [idsToEnable, setIdsToEnable] = useState<string[]>([]);
  const [idsToUpdate, setIdsToUpdate] = useState<string[]>([]);

  const { updateGuest, loadingIds: guestLoadingIds } = useEventGuestMutations(eventId);
  const { disableUser, enableUser, loadingIds: userLoadingIds } = useUserMutations();

  const { control, handleSubmit, reset } = useForm<FormValues>();

  const loadingIds = [...guestLoadingIds, ...userLoadingIds];

  useEffect(() => {
    reset({ isAttending: undefined });
  }, [idsToUpdate.length]);

  const handleActionClick = (action: EventGuestActions, ids: string[]) => {
    switch (action) {
      case EventGuestActions.ENABLE:
        setIdsToEnable(ids);
        return;
      case EventGuestActions.DISABLE:
        setIdsToDisable(ids);
        return;
      case EventGuestActions.UPDATE:
        setIdsToUpdate(ids);
        return;

      default:
        return;
    }
  };

  const updateGuests = async (state: FormValues) => {
    await updateGuest.updateAll(
      idsToUpdate,
      attendingOptionValues[state.isAttending.value as keyof typeof attendingOptionValues],
      () => {
        setIdsToUpdate([]);
      },
    );
  };

  const handleConfirmEnableActionClick = async () => {
    await enableUser.enableAll(idsToEnable);
    setIdsToEnable([]);
  };

  const handleCloseEnableConfirmationModal = async () => {
    setIdsToEnable([]);
  };

  const handleConfirmDisableActionClick = async () => {
    await disableUser.disableAll(idsToDisable);
    setIdsToDisable([]);
  };

  const handleCloseDisableConfirmationModal = async () => {
    setIdsToDisable([]);
  };

  const handleCloseUpdateGuestsModal = async () => {
    setIdsToUpdate([]);
  };

  const modalsNode = (
    <>
      <ConfirmationModalComponent
        isOpen={!!idsToDisable.length}
        actionText="Disable"
        isLoading={!!loadingIds.length}
        onActionClick={handleConfirmDisableActionClick}
        onClose={handleCloseDisableConfirmationModal}>
        <Typography variant="body1">Are you sure you want to disable all the selected guest accounts?</Typography>
        <Typography variant="body1">
          Selected guests: <strong>{idsToDisable.length}</strong>
        </Typography>
        <Typography variant="subtitle2">
          By disabling, all the selected guests related data will be disabled as well.
        </Typography>
      </ConfirmationModalComponent>

      <ConfirmationModalComponent
        isOpen={!!idsToEnable.length}
        actionText="Enable"
        buttonColor="success"
        isLoading={!!loadingIds.length}
        onActionClick={handleConfirmEnableActionClick}
        onClose={handleCloseEnableConfirmationModal}>
        <Typography variant="body1">Are you sure you want to enable all the selected guest accounts?</Typography>
        <Typography variant="body1">
          Selected guests: <strong>{idsToEnable.length}</strong>
        </Typography>
        <Typography variant="subtitle2">
          By enabling, all the selected guests related data will be enabled (restored) as well.
        </Typography>
      </ConfirmationModalComponent>

      <ActionModalComponent
        title="Updating a guest"
        isOpen={!!idsToUpdate.length}
        actionText="Update"
        isLoading={!!loadingIds.length}
        onSubmit={handleSubmit(updateGuests)}
        onClose={handleCloseUpdateGuestsModal}>
        <Typography variant="body1">
          Selected guests: <strong>{idsToUpdate.length}</strong>
        </Typography>
        <AutocompleteInputComponent
          control={control}
          name="isAttending"
          label="Attending Status"
          size="small"
          options={options}
          variant="outlined"
          type="text"
          placeholder="Attending Status"
          rules={{ required: 'Required' }}
        />
        <Typography variant="subtitle2">
          By updating, all the selected guests&apos; invitations will be updated.
        </Typography>
      </ActionModalComponent>
    </>
  );

  return {
    actions,
    disabledActions,
    loadingIds,
    modalsNode,
    handleActionClick,
  };
};
