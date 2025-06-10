import { useState } from 'react';
import { MutationGenqlSelection } from '@up-from/graphql-ap/genql';
import { organizationsFields, organizationsFieldsWithRelations } from '~/api/queryFields';
import { useTypedMutation } from '~/hooks/useTypedMutation';
import { useToast } from '~/hooks/useToast';
import { getNotificationSuccessMessageInPlural } from '~/util/text';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type CreateOrganizationArgs = MutationGenqlSelection['createOrganization']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type UpdateOrganizationArgs = MutationGenqlSelection['updateOrganization']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type RemoveOrganizationArgs = MutationGenqlSelection['removeOrganization']['__args'];

export const useOrganizationMutations = () => {
  const toast = useToast();
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const [createData, executeCreateOrganization] = useTypedMutation((args: CreateOrganizationArgs) => ({
    createOrganization: { __args: args, ...organizationsFieldsWithRelations },
  }));

  const [updateData, executeUpdateOrganization] = useTypedMutation((args: UpdateOrganizationArgs) => ({
    updateOrganization: { __args: args, ...organizationsFields },
  }));

  const [removeData, executeRemoveOrganization] = useTypedMutation((args: RemoveOrganizationArgs) => ({
    removeOrganization: { __args: args, ...organizationsFields },
  }));

  const createOrganization = async (args: CreateOrganizationArgs, callback?: () => void) => {
    try {
      const { data } = await executeCreateOrganization(args);
      if (!data?.createOrganization) return;

      toast.showSuccess(`The organization "${args.name}" has been successfully created`);
      callback?.();
    } catch {
      toast.showError('Something went wrong');
    }
  };

  const updateOrganization = async (args: UpdateOrganizationArgs) => {
    const { data } = await executeUpdateOrganization(args);
    if (!data?.updateOrganization) return;
    toast.showSuccess(`The organization "${args.name}" has been successfully updated`);
  };

  const removeOrganization = async (id: RemoveOrganizationArgs['id']) => {
    try {
      const { data } = await executeRemoveOrganization({ id });
      if (!data?.removeOrganization) return;

      toast.showSuccess(`The organization has been successfully removed`);
    } catch {
      toast.showError('Something went wrong');
    }
  };

  const removeAll = async (ids: RemoveOrganizationArgs['id'][]) => {
    setLoadingIds(ids);
    try {
      const mutations = ids.map(id => executeRemoveOrganization({ id }));

      const results = await Promise.all(mutations);
      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(
          getNotificationSuccessMessageInPlural(ids.length, 'organization', 'been successfully removed'),
        );
      }
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  return {
    loadingIds,
    createOrganization: {
      data: createData.data?.createOrganization,
      fetching: createData.fetching,
      create: createOrganization,
    },
    updateOrganization: { data: updateData?.data, fetching: updateData.fetching, update: updateOrganization },
    removeOrganization: {
      data: removeData?.data,
      fetching: removeData.fetching,
      remove: removeOrganization,
      removeAll,
    },
  };
};
