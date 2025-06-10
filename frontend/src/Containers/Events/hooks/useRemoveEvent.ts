import { useState } from 'react';
import { MutationGenqlSelection } from '@up-from/graphql/genql';
import { useTypedMutation } from '~urql';
import { removeEventFromAppCalendar } from '~utils/calendar';

// @ts-ignore
type RemoveEventArgs = MutationGenqlSelection['cancelEvent']['__args'];

export const useRemoveEventQueries = (eventId: string, callback: () => void) => {
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);

  const [{ fetching: isRemoveLoading }, executeCancelEventMutation] = useTypedMutation((args: RemoveEventArgs) => ({
    cancelEvent: {
      __args: args,
      id: true,
      startsAt: true,
      endsAt: true,
      title: true,
      teamId: true,
      isIndividual: true,
    },
  }));

  const removeEvent = async () => {
    try {
      const { data } = await executeCancelEventMutation({ id: eventId });
      if (!data?.cancelEvent) return;

      await removeEventFromAppCalendar(data?.cancelEvent);
      setIsRemoveModalVisible(false);
      callback();
    } catch (error) {
      console.log('removing event error: ', error);
    }
  };

  return { isRemoveLoading, isRemoveModalVisible, setIsRemoveModalVisible, removeEvent };
};
