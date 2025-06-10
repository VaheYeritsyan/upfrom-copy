import React from 'react';
import { useUserMutations } from '~/api/useUsersMutations';
import { useUsersTableActions } from '~/hooks/useUsersTableActions';
import { DisabledActions } from '~/types/table';
import { UserWithAttendance } from '~/types/eventUsers';

enum UserActions {
  DEFAULT_ACTION = 'Default Action',
}

const actions = Object.values(UserActions);

export const useInvitedUsersTableActions = (teamId?: string) => {
  const { loadingIds } = useUserMutations();
  const usersTableActions = useUsersTableActions(teamId);

  const handleActionClick = (action: UserActions, ids: string[]) => {
    switch (action) {
      case UserActions.DEFAULT_ACTION:
        console.log('Default action clicked' + ids);
        return;

      default:
        usersTableActions.handleActionClick(action, ids);
        return;
    }
  };

  const modalsNode = <>{usersTableActions.modalsNode}</>;

  return {
    actions: [...actions, ...usersTableActions.actions] as UserActions[],
    disabledActions: usersTableActions.disabledActions as unknown as DisabledActions<UserActions, UserWithAttendance>,
    loadingIds,
    modalsNode,
    handleActionClick,
    handleCreateUserClick: usersTableActions.handleCreateUserClick,
  };
};
