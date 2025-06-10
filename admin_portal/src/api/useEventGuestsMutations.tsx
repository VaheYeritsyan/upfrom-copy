import { useState } from 'react';
import { useTypedMutation } from '~/hooks/useTypedMutation';
import { MutationGenqlSelection } from '@up-from/graphql-ap/genql';
import { useToast } from '~/hooks/useToast';
import { getNotificationSuccessMessageInPlural } from '~/util/text';
import { eventUserFieldsWithRelations } from '~/api/queryFields';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type RemoveEventUserArgs = MutationGenqlSelection['removeEventUser']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type UpdateEventUserArgs = MutationGenqlSelection['updateEventUser']['__args'];

export const useEventGuestMutations = (eventId?: string) => {
  const toast = useToast();
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const [removeData, executeRemoveEventGuest] = useTypedMutation((args: RemoveEventUserArgs) => ({
    removeEventUser: { __args: args, eventId: true, userId: true },
  }));

  const [updateData, executeUpdateEventGuest] = useTypedMutation((args: UpdateEventUserArgs) => ({
    updateEventUser: { __args: args, id: true, updatedAt: true, guests: eventUserFieldsWithRelations },
  }));

  const removeAll = async (ids: RemoveEventUserArgs['userId'][]) => {
    if (!eventId) return;

    setLoadingIds(ids);
    try {
      const mutations = ids.map(userId => executeRemoveEventGuest({ userId, eventId }));

      const results = await Promise.all(mutations);
      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(getNotificationSuccessMessageInPlural(ids.length, 'guest', 'been successfully removed'));
      }
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  const updateAll = async (
    ids: UpdateEventUserArgs['userId'][],
    isAttending: UpdateEventUserArgs['isAttending'],
    callback?: () => void,
  ) => {
    if (!eventId) return;

    setLoadingIds(ids);
    try {
      const mutations = ids.map(userId => executeUpdateEventGuest({ userId, eventId, isAttending }));

      const results = await Promise.all(mutations);
      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(getNotificationSuccessMessageInPlural(ids.length, 'user', 'been successfully updated'));
      }
      callback?.();
    } catch (e) {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  return {
    loadingIds,
    removeGuest: {
      data: removeData.data?.removeEventUser,
      fetching: removeData.fetching,
      disable: executeRemoveEventGuest,
      removeAll,
    },
    updateGuest: {
      data: updateData.data?.updateEventUser,
      fetching: updateData.fetching,
      enable: executeUpdateEventGuest,
      updateAll,
    },
  };
};
