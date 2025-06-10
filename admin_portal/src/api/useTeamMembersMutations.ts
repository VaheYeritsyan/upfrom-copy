import { useState } from 'react';
import { useTypedMutation } from '~/hooks/useTypedMutation';
import { MutationGenqlSelection } from '@up-from/graphql-ap/genql';
import { useToast } from '~/hooks/useToast';
import { getNotificationSuccessMessageInPlural } from '~/util/text';
import { teamFieldsWithRelations, teamUserFieldsWithRelations, userFieldsWithRelations } from '~/api/queryFields';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type AddTeamMemberArgs = MutationGenqlSelection['addTeamMember']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type RemoveTeamMemberArgs = MutationGenqlSelection['removeTeamMember']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type UpdateTeamMemberArgs = MutationGenqlSelection['updateTeamMemberRole']['__args'];

export const useTeamMembersMutations = (teamId?: string) => {
  const toast = useToast();
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const [addMemberData, executeAddMember] = useTypedMutation((args: AddTeamMemberArgs) => ({
    addTeamMember: {
      __args: args,
      id: true,
      members: { ...teamUserFieldsWithRelations, user: { ...userFieldsWithRelations, teams: teamFieldsWithRelations } },
    },
  }));

  const [removeMemberData, executeRemoveMember] = useTypedMutation((args: RemoveTeamMemberArgs) => ({
    removeTeamMember: {
      __args: args,
      id: true,
      members: { ...teamUserFieldsWithRelations, user: userFieldsWithRelations },
    },
  }));

  const [updateMemberData, executeUpdateMember] = useTypedMutation((args: UpdateTeamMemberArgs) => ({
    updateTeamMemberRole: {
      __args: args,
      id: true,
      members: { ...teamUserFieldsWithRelations, user: userFieldsWithRelations },
    },
  }));

  const updateAll = async (ids: UpdateTeamMemberArgs['id'][], role: string, callback?: () => void) => {
    if (!teamId) return;

    setLoadingIds(ids);
    try {
      const mutations = ids.map(userId => executeUpdateMember({ userId, teamId, role }));

      const results = await Promise.all(mutations);
      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(
          getNotificationSuccessMessageInPlural(ids.length, 'team member', 'been successfully updated'),
        );
      }

      callback?.();
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  const removeAll = async (ids: RemoveTeamMemberArgs['id'][], callback?: () => void) => {
    if (!teamId) return;

    setLoadingIds(ids);
    try {
      const mutations = ids.map(userId => executeRemoveMember({ userId, teamId }));

      const results = await Promise.all(mutations);
      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(
          getNotificationSuccessMessageInPlural(ids.length, 'team member', 'been successfully removed'),
        );
      }

      callback?.();
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  const updateMember = async (args: UpdateTeamMemberArgs) => {
    try {
      const { data, error } = await executeUpdateMember(args);
      if (!data || error) return;

      toast.showSuccess('Team member has been successfully updated');
    } catch {
      toast.showError('Something went wrong');
    }
  };

  const createMember = async (args: AddTeamMemberArgs, callback?: () => void) => {
    try {
      const { data, error } = await executeAddMember(args);
      if (!data || error) return;

      toast.showSuccess('User has been successfully added to the team');

      callback?.();
    } catch {
      toast.showError('Something went wrong');
    }
  };

  const removeMember = async (args: RemoveTeamMemberArgs, callback?: () => void) => {
    try {
      const { data, error } = await executeRemoveMember(args);
      if (!data || error) return;

      toast.showSuccess('User has been successfully removed from the team');

      callback?.();
    } catch {
      toast.showError('Something went wrong');
    }
  };

  return {
    loadingIds,
    createMember: {
      data: addMemberData.data?.addTeamMember,
      fetching: addMemberData.fetching,
      create: createMember,
    },
    updateMember: {
      data: updateMemberData.data?.updateTeamMemberRole,
      fetching: updateMemberData.fetching,
      update: updateMember,
      updateAll,
    },
    removeMember: {
      data: removeMemberData.data?.removeTeamMember,
      fetching: removeMemberData.fetching,
      remove: removeMember,
      removeAll,
    },
  };
};
