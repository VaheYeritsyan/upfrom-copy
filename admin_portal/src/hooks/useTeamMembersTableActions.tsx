import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import { User, Team } from '@up-from/graphql-ap/genql';
import { UserActions, useUsersTableActions } from '~/hooks/useUsersTableActions';
import { DisabledActions } from '~/types/table';
import { useTeamMembersMutations } from '~/api/useTeamMembersMutations';
import { AutocompleteInputComponent } from '~/components/Input/AutocompleteInputComponent';
import { ActionModalComponent } from '~/components/Modal/ActionModalComponent';
import { ConfirmationModalComponent } from '~/components/Modal/ConfirmationModalComponent';

type FormValues = {
  role: { label: string; value: string };
};

enum TeamMemberActions {
  UPDATE = 'Update',
  REMOVE = 'Remove',
}

enum UserRole {
  MEMBER = 'member',
  MENTOR = 'mentor',
}

const actions = Object.values(TeamMemberActions);
const userRoleOptions = Object.values(UserRole).map(value => ({ label: value, value }));
const disabledMembersActions: DisabledActions<TeamMemberActions, User> = {
  [TeamMemberActions.UPDATE]: { isDisabled: true },
};

export const useTeamMembersTableActions = (teamId?: string) => {
  const [idsToUpdate, setIdsToUpdate] = useState<string[]>([]);
  const [idsToRemove, setIdsToRemove] = useState<string[]>([]);

  const usersTableActions = useUsersTableActions(teamId);
  const { updateMember, removeMember, loadingIds: loadingIdsMembers } = useTeamMembersMutations(teamId);

  const { control, handleSubmit, reset } = useForm<FormValues>();

  const loadingIds: string[] = [...usersTableActions.loadingIds, ...loadingIdsMembers];

  useEffect(() => {
    reset({ role: undefined });
  }, [idsToUpdate.length]);

  const handleActionClick = (action: TeamMemberActions & UserActions, ids: string[]) => {
    switch (action) {
      case TeamMemberActions.REMOVE:
        setIdsToRemove(ids);
        return;
      case TeamMemberActions.UPDATE:
        setIdsToUpdate(ids);
        return;

      default:
        return usersTableActions.handleActionClick(action, ids);
    }
  };

  const updateMembers = async (state: FormValues) => {
    await updateMember.updateAll(idsToUpdate, state.role.value, () => {
      setIdsToUpdate([]);
    });
  };

  const handleCloseUpdateGuestsModal = async () => {
    setIdsToUpdate([]);
  };

  const handleConfirmRemoveActionClick = async () => {
    await removeMember.removeAll(idsToRemove);
    setIdsToRemove([]);
  };

  const handleCloseRemoveConfirmationModal = async () => {
    setIdsToRemove([]);
  };

  const modalsNode = (
    <>
      {usersTableActions.modalsNode}

      <ActionModalComponent
        title="Updating a member"
        isOpen={!!idsToUpdate.length}
        actionText="Update"
        isLoading={!!loadingIds.length}
        onSubmit={handleSubmit(updateMembers)}
        onClose={handleCloseUpdateGuestsModal}>
        <Typography variant="body1">
          Selected members: <strong>{idsToUpdate.length}</strong>
        </Typography>
        <AutocompleteInputComponent
          control={control}
          name="role"
          label="Role"
          size="small"
          options={userRoleOptions}
          variant="outlined"
          type="text"
          placeholder="Role"
          rules={{ required: 'Required' }}
        />
        <Typography variant="subtitle2">By updating, all the selected members&apos; role will be updated.</Typography>
      </ActionModalComponent>

      <ConfirmationModalComponent
        isOpen={!!idsToRemove.length}
        actionText="Remove"
        isLoading={!!loadingIds.length}
        onActionClick={handleConfirmRemoveActionClick}
        onClose={handleCloseRemoveConfirmationModal}>
        <Typography variant="body1">Are you sure you want to remove all the selected members?</Typography>
        <Typography variant="body1">
          Selected guests: <strong>{idsToRemove.length}</strong>
        </Typography>
        <Typography variant="subtitle2">
          By removing, all the selected members will be removed from the team.
        </Typography>
      </ConfirmationModalComponent>
    </>
  );

  return {
    actions: [...usersTableActions.actions, ...actions] as TeamMemberActions[] & UserActions[],
    disabledActions: { ...usersTableActions.disabledActions, ...disabledMembersActions } as DisabledActions<
      UserActions & TeamMemberActions,
      Team
    >,
    loadingIds,
    modalsNode,
    handleActionClick,
    handleCreateUserClick: usersTableActions.handleCreateUserClick,
  };
};
