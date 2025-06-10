import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import { Organization, Team } from '@up-from/graphql-ap/genql';
import { useTeamMutations } from '~/api/useTeamMutations';
import { ConfirmationModalComponent } from '~/components/Modal/ConfirmationModalComponent';
import { CreateTeamModalComponent, CreateTeamArgs } from '~/components/CreateTeam/CreateTeamModalComponent';
import { useAllOrganizationsQuery } from '~/api/useAllOrganizationsQuery';
import { AutocompleteInputComponent } from '~/components/Input/AutocompleteInputComponent';
import { ActionModalComponent } from '~/components/Modal/ActionModalComponent';
import { filterOrganizationOptions } from '~/util/autocomplete';
import { AutocompleteInputOptionComponent } from '~/components/Input/AutocompleteInputOptionComponent';

enum TeamActions {
  ENABLE = 'Enable',
  DISABLE = 'Disable',
  UPDATE_ORGANIZATION = 'Update Organization',
}

type UpdateOrgFormValues = {
  organization: Organization | null;
};

const actions = Object.values(TeamActions);
const disabledActions = {
  [TeamActions.ENABLE]: { isDisabled: false },
  [TeamActions.DISABLE]: { isDisabled: true },
};

export const useTeamsTableActions = (teams: Team[], organizationId?: string) => {
  const [isCreateTeamModalVisible, setCreateTeamModalVisible] = useState(false);
  const [idsToUpdateOrg, setIdsToUpdateOrg] = useState<string[]>([]);
  const [idsToDisable, setIdsToDisable] = useState<string[]>([]);
  const [idsToEnable, setIdsToEnable] = useState<string[]>([]);

  const { createTeam, disableTeam, updateTeam, enableTeam, loadingIds } = useTeamMutations();
  const organizationsData = useAllOrganizationsQuery();

  const { control, handleSubmit, reset, setValue } = useForm<CreateTeamArgs>({
    defaultValues: {
      description: '',
      name: '',
    },
  });

  const updateOrganizationForm = useForm<UpdateOrgFormValues>();

  useEffect(() => {
    if (isCreateTeamModalVisible) return;

    reset({ description: '', name: '', organization: null });
  }, [isCreateTeamModalVisible]);

  useEffect(() => {
    if (idsToUpdateOrg.length) return;

    updateOrganizationForm.reset({ organization: null });
  }, [idsToUpdateOrg.length]);

  useEffect(() => {
    if (
      !isCreateTeamModalVisible ||
      !organizationId ||
      organizationsData.fetching ||
      !organizationsData.organizations.length
    )
      return;

    const organization = organizationsData.organizations.find(org => org.id === organizationId);
    if (!organization) return;
    setValue('organization', {
      ...organization,
      imageUrl: organization.imageUrl ?? null,
    });
  }, [isCreateTeamModalVisible, organizationsData.fetching]);

  const handleActionClick = (action: TeamActions, ids: string[]) => {
    switch (action) {
      case TeamActions.ENABLE:
        setIdsToEnable(ids);
        return;
      case TeamActions.DISABLE:
        setIdsToDisable(ids);
        return;
      case TeamActions.UPDATE_ORGANIZATION:
        setIdsToUpdateOrg(ids);
        return;

      default:
        return;
    }
  };

  const createNewTeam = async ({ organization, ...args }: CreateTeamArgs) => {
    if (!organization?.id) return;

    await createTeam.create({ ...args, organizationId: organization.id }, () => {
      setCreateTeamModalVisible(false);
    });
  };

  const handleCreateTeamClick = () => {
    setCreateTeamModalVisible(true);
  };

  const handleCreateTeamModalClose = () => {
    setCreateTeamModalVisible(false);
  };

  const handleConfirmEnableActionClick = async () => {
    await enableTeam.enableAll(idsToEnable);
    setIdsToEnable([]);
  };

  const handleCloseEnableConfirmationModal = async () => {
    setIdsToEnable([]);
  };

  const handleConfirmDisableActionClick = async () => {
    await disableTeam.disableAll(idsToDisable);
    setIdsToDisable([]);
  };

  const handleCloseDisableConfirmationModal = async () => {
    setIdsToDisable([]);
  };

  const updateTeamsOrg = async (state: UpdateOrgFormValues) => {
    if (!state.organization?.id) return;

    await updateTeam.updateOrgAll(
      teams.filter(({ id }) => idsToUpdateOrg.includes(id)),
      state.organization?.id,
    );
    setIdsToUpdateOrg([]);
  };

  const handleCloseUpdateOrgModal = async () => {
    setIdsToUpdateOrg([]);
  };

  const modalsNode = (
    <>
      <CreateTeamModalComponent
        control={control}
        isOrganizationDisabled={!!organizationId}
        organizations={organizationsData.organizations.map(org => ({ ...org, imageUrl: org.imageUrl ?? null }))}
        isOrganizationsLoading={organizationsData.fetching}
        onSubmit={handleSubmit(createNewTeam)}
        onClose={handleCreateTeamModalClose}
        isOpen={isCreateTeamModalVisible}
        isLoading={createTeam.fetching}
      />

      <ConfirmationModalComponent
        isOpen={!!idsToDisable.length}
        actionText="Disable"
        isLoading={disableTeam.fetching}
        onActionClick={handleConfirmDisableActionClick}
        onClose={handleCloseDisableConfirmationModal}>
        <Typography variant="body1">Are you sure you want to disable all the selected user accounts?</Typography>
        <Typography variant="body1">
          Selected teams: <strong>{idsToDisable.length}</strong>
        </Typography>
        <Typography variant="subtitle2">
          By disabling, all the selected teams&apos; members will be disabled as well.
        </Typography>
      </ConfirmationModalComponent>

      <ConfirmationModalComponent
        isOpen={!!idsToEnable.length}
        actionText="Enable"
        buttonColor="success"
        isLoading={enableTeam.fetching}
        onActionClick={handleConfirmEnableActionClick}
        onClose={handleCloseEnableConfirmationModal}>
        <Typography variant="body1">Are you sure you want to enable all the selected teams?</Typography>
        <Typography variant="body1">
          Selected teams: <strong>{idsToEnable.length}</strong>
        </Typography>
        <Typography variant="subtitle2">
          By enabling, all the selected teams&apos; members will be enabled (restored) as well.
        </Typography>
      </ConfirmationModalComponent>

      <ActionModalComponent
        title="Updating team organization"
        isOpen={!!idsToUpdateOrg.length}
        actionText="Update"
        isLoading={!!loadingIds.length}
        onSubmit={updateOrganizationForm.handleSubmit(updateTeamsOrg)}
        onClose={handleCloseUpdateOrgModal}>
        <Typography variant="body1">
          Selected teams: <strong>{idsToUpdateOrg.length}</strong>
        </Typography>
        <AutocompleteInputComponent
          control={updateOrganizationForm.control}
          name="organization"
          label="Organization"
          size="small"
          isOptionEqualToValue={(option, value) => option.id === value.id}
          isLoading={organizationsData.fetching}
          getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
          filterOptions={filterOrganizationOptions}
          variant="outlined"
          options={organizationsData.organizations}
          renderOption={(props, org) => (
            <AutocompleteInputOptionComponent {...props} key={org.id} title={org.name} subtitle={org.id} withoutImg />
          )}
        />
        <Typography variant="subtitle2">The organization will be set to all the selected teams.</Typography>
      </ActionModalComponent>
    </>
  );

  return {
    actions,
    disabledActions,
    loadingIds,
    modalsNode,
    handleCreateTeamClick,
    handleActionClick,
  };
};
