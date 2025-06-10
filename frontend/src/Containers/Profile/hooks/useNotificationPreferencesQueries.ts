import { MutationGenqlSelection } from '@up-from/graphql/genql';
import { useTypedMutation } from '~urql';

// @ts-ignore
export type UpdateNotificationsPreferencesArgs = MutationGenqlSelection['updateMyNotificationPreferences']['__args'];

export const useNotificationPreferencesQueries = () => {
  const [{ fetching }, executeUpdate] = useTypedMutation((args: UpdateNotificationsPreferencesArgs) => ({
    updateMyNotificationPreferences: {
      __args: args,
      id: true,
      notificationPreferences: {
        emailChatNewMessage: true,
        emailEventPendingInvitation: true,
        pushChatNewMessage: true,
        pushTeamNewMember: true,
        pushEventCancelled: true,
        pushEventNewAllTeam: true,
        pushEventNewInvitation: true,
        pushEventRemovedIndividual: true,
        pushEventUpdatedDateTime: true,
        pushEventUpdatedLocation: true,
      },
    },
  }));

  return { isLoading: fetching, update: executeUpdate };
};
