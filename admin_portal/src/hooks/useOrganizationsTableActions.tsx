import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import {
  CreateOrganizationModalComponent,
  CreateOrganizationArgs,
} from '~/components/CreateOrganization/CreateOrganizationModalComponent';
import { ConfirmationModalComponent } from '~/components/Modal/ConfirmationModalComponent';
import { useOrganizationMutations } from '~/api/useOrganizationMutations';

enum OrganizationActions {
  REMOVE = 'Remove',
}

const actions = Object.values(OrganizationActions);

export const useOrganizationsTableActions = () => {
  const [isCreateOrganizationModalVisible, setCreateOrganizationModalVisible] = useState(false);
  const [idsToRemove, setIdsToRemove] = useState<string[]>([]);

  const { createOrganization, removeOrganization, loadingIds } = useOrganizationMutations();

  const { control, handleSubmit, reset } = useForm<CreateOrganizationArgs>({
    defaultValues: {
      name: '',
      details: '',
    },
  });

  useEffect(() => {
    if (isCreateOrganizationModalVisible) return;

    reset({ details: '', name: '' });
  }, [isCreateOrganizationModalVisible]);

  const handleActionClick = (action: OrganizationActions, ids: string[]) => {
    switch (action) {
      case OrganizationActions.REMOVE:
        setIdsToRemove(ids);
        return;

      default:
        return;
    }
  };

  const createNewOrganization = async (state: CreateOrganizationArgs) => {
    await createOrganization.create(state, () => {
      setCreateOrganizationModalVisible(false);
    });
  };

  const handleCreateOrganizationClick = () => {
    setCreateOrganizationModalVisible(true);
  };

  const handleCreateOrganizationModalClose = () => {
    setCreateOrganizationModalVisible(false);
  };

  const handleConfirmRemoveActionClick = async () => {
    await removeOrganization.removeAll(idsToRemove);
    setIdsToRemove([]);
  };

  const handleCloseRemoveConfirmationModal = async () => {
    setIdsToRemove([]);
  };

  const modalsNode = (
    <>
      <CreateOrganizationModalComponent
        control={control}
        onSubmit={handleSubmit(createNewOrganization)}
        onClose={handleCreateOrganizationModalClose}
        isOpen={isCreateOrganizationModalVisible}
        isLoading={createOrganization.fetching}
      />

      <ConfirmationModalComponent
        isOpen={!!idsToRemove.length}
        actionText="Remove"
        isLoading={!!loadingIds.length}
        onActionClick={handleConfirmRemoveActionClick}
        onClose={handleCloseRemoveConfirmationModal}>
        <Typography variant="body1">Are you sure you want to remove all the selected organizations?</Typography>
        <Typography variant="body1">
          Selected organizations: <strong>{idsToRemove.length}</strong>
        </Typography>
        <Typography variant="subtitle2">
          By removing, all the selected organization will removed without an ability to revert.
        </Typography>
      </ConfirmationModalComponent>
    </>
  );

  return {
    actions,
    loadingIds,
    modalsNode,
    handleCreateOrganizationClick,
    handleActionClick,
  };
};
