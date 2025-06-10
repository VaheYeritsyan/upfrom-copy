import { MutationGenqlSelection, EventGenqlSelection, EventUser, Event } from '@up-from/graphql/genql';
import { useTypedMutation, useTypedQuery } from '~urql';
import { useMemo, useState } from 'react';
import { updateEventInAppCalendar } from '~utils/calendar';
import { removeEntityFields } from '~utils/entityFormat';
import { useEventDetailsQueries } from '~Containers/Events/hooks/useEventDetailsQueries';

// @ts-ignore
type UpdateEventArgs = MutationGenqlSelection['updateMyEvent']['__args'] & {
  invitedIds?: string[];
};
// @ts-ignore
type GenerateEventImageUrlArgs = MutationGenqlSelection['generateEventImageUploadUrl']['__args'];
// @ts-ignore
type SetEventGuestsArgs = MutationGenqlSelection['setEventGuests']['__args'];
// @ts-ignore
type RemoveEventGuestsArgs = MutationGenqlSelection['removeEventImage']['__args'];

const eventFields: EventGenqlSelection = {
  id: true,
  title: true,
  description: true,
  endsAt: true,
  startsAt: true,
  imageUrl: true,
  address: true,
  location: {
    locationID: true,
    locationName: true,
    lat: true,
    lng: true,
  },
  isIndividual: true,
  teamId: true,
  guests: {
    isAttending: true,
    userId: true,
    user: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      isDisabled: true,
    },
  },
};

export const useEditEventQueries = (eventId: string, callback: () => void) => {
  const [isUploadLoading, setIsUploadLoading] = useState(false);

  const { event, guests, owner } = useEventDetailsQueries(eventId);

  const eventData = { event: { ...event, guests, owner, location: event?.location ?? undefined } as Event };
  const [{ data: teamData }] = useTypedQuery({
    query: {
      team: {
        __args: { id: eventData?.event.team?.id! },
        id: true,
        members: {
          role: true,
          user: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    },
    requestPolicy: 'cache-and-network',
    pause: !eventData?.event.team?.id,
  });

  const [{ fetching: isGuestsLoading }, executeSetGuests] = useTypedMutation((args: SetEventGuestsArgs) => ({
    setEventGuests: { __args: args, id: true, guests: eventFields.guests },
  }));

  const [{ fetching: isLoading }, executeUpdateMutation] = useTypedMutation((args: UpdateEventArgs) => ({
    updateMyEvent: { __args: args, ...eventFields },
  }));

  const [, executeGenerateImageUrlMutation] = useTypedMutation((args: GenerateEventImageUrlArgs) => ({
    generateEventImageUploadUrl: { __args: args },
  }));

  const [, executeCompleteImageUploadMutation] = useTypedMutation((args: GenerateEventImageUrlArgs) => ({
    completeEventImageUpload: { __args: args, id: true, imageUrl: true },
  }));

  const [, executeRemoveImageMutation] = useTypedMutation((args: RemoveEventGuestsArgs) => ({
    removeEventImage: { __args: args, id: true, imageUrl: true },
  }));

  const uploadImage = async (blob?: Blob) => {
    setIsUploadLoading(true);

    const { data, error } = await executeGenerateImageUrlMutation({ id: eventId });
    if (!data || error) {
      console.log('generating event image upload url error: ', error);
      return;
    }

    try {
      await fetch(data.generateEventImageUploadUrl, { method: 'PUT', body: blob });
      await executeCompleteImageUploadMutation({ id: eventId });
    } catch (err) {
      console.log('uploading event image error: ', err);
    } finally {
      setIsUploadLoading(false);
    }
  };

  const removeImage = async () => {
    if (!eventData?.event) return;
    setIsUploadLoading(true);

    try {
      await executeRemoveImageMutation({ id: eventData.event.id });
    } catch (error) {
      console.log('removing event image error: ', error);
    } finally {
      setIsUploadLoading(false);
    }
  };

  const editMembers = async (invitedIds: string[]) => {
    const event = eventData?.event;
    if (!event) return;

    try {
      const eventMembers = (event.guests as Required<EventUser>[]).filter(
        guest => guest.user && !invitedIds?.includes(guest.user.id),
      );
      if (!eventMembers.length && invitedIds.length === event.guests.length) return;

      await executeSetGuests({ eventId: event.id, userIds: invitedIds });
    } catch (error) {
      console.log('removing setting members image error: ', error);
    }
  };

  const editEvent = async ({ invitedIds, ...args }: UpdateEventArgs) => {
    try {
      const { data } = await executeUpdateMutation({
        ...removeEntityFields(args, ['teamId']),
        id: eventId,
      });
      await editMembers(invitedIds);
      if (!data?.updateMyEvent) return;

      callback();
      await updateEventInAppCalendar(eventData!.event as Event, data.updateMyEvent);
    } catch (error) {
      console.log('updating event error: ', error);
    }
  };

  const members = useMemo(() => teamData?.team?.members || [], [teamData?.team?.members]);

  return {
    event: eventData?.event || null,
    isLoading: isLoading || isGuestsLoading,
    isUploadLoading,
    members,
    editEvent,
    uploadImage,
    removeImage,
  };
};
