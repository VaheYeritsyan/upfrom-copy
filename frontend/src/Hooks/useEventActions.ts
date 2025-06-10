import { useTypedMutation } from '~urql';
import { useEventActionsModalsContext } from '~Hooks/useEventActionsModalsContext';
import { MutationGenqlSelection } from '@up-from/graphql/genql';

// @ts-ignore
type JoinAllTeamEventArgs = MutationGenqlSelection['joinAllTeamsEvent']['__args'];
// @ts-ignore
type LeaveAllTeamEventArgs = MutationGenqlSelection['leaveAllTeamsEvent']['__args'];
// @ts-ignore
type UpdateMyInvitationArgs = MutationGenqlSelection['updateMyInvitation']['__args'];

const eventFields = {
  startsAt: true,
  imageUrl: true,
  address: true,
  location: {
    locationID: true,
    locationName: true,
    lat: true,
    lng: true,
  },
  description: true,
  isIndividual: true,
  title: true,
  endsAt: true,
  ownerId: true,
  teamId: true,
  id: true,
  team: {
    id: true,
    name: true,
    imageUrl: true,
  },
  guests: {
    isAttending: true,
    user: {
      firstName: true,
      lastName: true,
      avatarUrl: true,
      id: true,
      isDisabled: true,
    },
  },
};

export const useEventActions = () => {
  const eventActions = useEventActionsModalsContext();

  const [{ fetching: isJoinAllTeamsLoading }, executeJoinAllTeamsEventMutation] = useTypedMutation(
    (args: JoinAllTeamEventArgs) => ({
      joinAllTeamsEvent: { __args: args, ...eventFields },
    }),
  );

  const [{ fetching: isLeaveAllTeamsLoading }, executeLeaveAllTeamsEventMutation] = useTypedMutation(
    (args: LeaveAllTeamEventArgs) => ({
      leaveAllTeamsEvent: { __args: args, ...eventFields },
    }),
  );

  const [{ fetching: isRespondLoading }, executeUpdateMyInvitationMutation] = useTypedMutation(
    (args: UpdateMyInvitationArgs) => ({
      updateMyInvitation: { __args: args, ...eventFields },
    }),
  );

  const joinEvent = async (callback?: (id: string) => void) => {
    if (!eventActions.notAttendingEventMeta) return;

    try {
      const { eventId, isAllTeamsEvent } = eventActions.notAttendingEventMeta;
      if (isAllTeamsEvent) await executeJoinAllTeamsEventMutation({ eventId: eventId });
      else await executeUpdateMyInvitationMutation({ eventId, isAttending: true });
      eventActions.setNotAttendingEventMeta(null);
      callback?.(eventId);
    } catch (error) {
      console.log('joining event error: ', error);
    }
  };

  const joinAllTeamsEvent = async (eventId: string) => {
    try {
      await executeJoinAllTeamsEventMutation({ eventId: eventId });
    } catch (error) {
      console.log('joining all teams event error: ', error);
    }
  };

  const leaveEvent = async () => {
    if (!eventActions.attendingEventMeta) return;

    try {
      const { eventId, isAllTeamsEvent } = eventActions.attendingEventMeta;
      if (isAllTeamsEvent) await executeLeaveAllTeamsEventMutation({ eventId });
      else await executeUpdateMyInvitationMutation({ eventId, isAttending: null });
      eventActions.setAttendingEventMeta(null);
    } catch (error) {
      console.log('leaving event error: ', error);
    }
  };

  const acceptInvitation = async (callback?: (id: string) => void) => {
    if (!eventActions.respondingEventMeta) return;

    try {
      const { eventId } = eventActions.respondingEventMeta;
      await executeUpdateMyInvitationMutation({ eventId, isAttending: true });
      eventActions.setRespondingEventMeta(null);
      callback?.(eventId);
    } catch (error) {
      console.log('accepting event error: ', error);
    }
  };

  const declineInvitation = async () => {
    if (!eventActions.respondingEventMeta) return;

    try {
      const { eventId } = eventActions.respondingEventMeta;
      await executeUpdateMyInvitationMutation({ eventId, isAttending: false });
      eventActions.setRespondingEventMeta(null);
    } catch (error) {
      console.log('declining event error: ', error);
    }
  };

  return {
    isAttendingLoading: isLeaveAllTeamsLoading || isRespondLoading,
    isNotAttendingLoading: isJoinAllTeamsLoading || isRespondLoading,
    isRespondLoading,
    leaveEvent,
    joinEvent,
    joinAllTeamsEvent,
    acceptInvitation,
    declineInvitation,
  };
};
