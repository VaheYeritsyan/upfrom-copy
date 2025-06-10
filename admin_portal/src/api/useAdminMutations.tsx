import { useState } from 'react';
import { useTypedMutation } from '~/hooks/useTypedMutation';
import { adminFields } from '~/api/queryFields';
import { MutationGenqlSelection } from '@up-from/graphql-ap/genql';
import { useToast } from '~/hooks/useToast';
import { getNotificationSuccessMessageInPlural } from '~/util/text';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type CreateAdminArgs = MutationGenqlSelection['createAdmin']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type DisableAdminArgs = MutationGenqlSelection['disableAdmin']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type EnableAdminArgs = MutationGenqlSelection['enableAdmin']['__args'];

export const useAdminMutations = () => {
  const toast = useToast();
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const [createData, executeCreateAdmin] = useTypedMutation((args: CreateAdminArgs) => ({
    createAdmin: { __args: args, ...adminFields },
  }));

  const [disableData, executeDisableAdmin] = useTypedMutation((args: DisableAdminArgs) => ({
    disableAdmin: { __args: args, ...adminFields },
  }));

  const [enableData, executeEnableAdmin] = useTypedMutation((args: EnableAdminArgs) => ({
    enableAdmin: { __args: args, ...adminFields },
  }));

  const createAdmin = async (args: CreateAdminArgs, callback?: () => void) => {
    await executeCreateAdmin(args);
    toast.showSuccess(`The "${args.email}" has been successfully whitelisted`);
    callback?.();
  };

  const disableAll = async (ids: DisableAdminArgs['id'][]) => {
    setLoadingIds(ids);
    try {
      const mutations = ids.map(id => executeDisableAdmin({ id }));

      const results = await Promise.all(mutations);
      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(getNotificationSuccessMessageInPlural(ids.length, 'admin', 'been successfully disabled'));
      }
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  const enableAll = async (ids: EnableAdminArgs['id'][]) => {
    setLoadingIds(ids);

    try {
      const mutations = ids.map(id => executeEnableAdmin({ id }));

      const results = await Promise.all(mutations);
      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(getNotificationSuccessMessageInPlural(ids.length, 'admin', 'been successfully enabled'));
      }
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  return {
    loadingIds,
    createAdmin: { data: createData.data?.createAdmin, fetching: createData.fetching, create: createAdmin },
    disableAdmin: {
      data: disableData.data?.disableAdmin,
      fetching: disableData.fetching,
      disable: executeDisableAdmin,
      disableAll,
    },
    enableAdmin: {
      data: enableData.data?.enableAdmin,
      fetching: enableData.fetching,
      enable: executeEnableAdmin,
      enableAll,
    },
  };
};
