import { useState } from 'react';
import { MutationGenqlSelection, EventGenqlSelection } from '@up-from/graphql/genql';
import { useTypedMutation } from '~urql';

// @ts-ignore
type CreateEventArgs = MutationGenqlSelection['createEvent']['__args'];
// @ts-ignore
type SetEventGuestsArgs = MutationGenqlSelection['setEventGuests']['__args'];
// @ts-ignore
type GenerateEventImageUrlArgs = MutationGenqlSelection['generateEventImageUploadUrl']['__args'];
type CreateEventPayload = CreateEventArgs & { blob?: Blob; invitedIds: string[] };

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
  ownerId: true,
  teamId: true,
  team: {
    id: true,
    name: true,
    imageUrl: true,
    organization: {
      id: true,
      name: true,
      details: true,
    },
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

export const useCreateEventQueries = (callback: (id: string) => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const [, executeCreateMutation] = useTypedMutation((args: CreateEventArgs) => ({
    createEvent: { __args: args, ...eventFields },
  }));

  const [, executeGenerateImageUrlMutation] = useTypedMutation((args: GenerateEventImageUrlArgs) => ({
    generateEventImageUploadUrl: { __args: args },
  }));

  const [, executeSetImageMutation] = useTypedMutation((args: GenerateEventImageUrlArgs) => ({
    completeEventImageUpload: { __args: args, id: true, imageUrl: true },
  }));

  const [, executeSetGuests] = useTypedMutation((args: SetEventGuestsArgs) => ({
    setEventGuests: { __args: args, id: true, guests: eventFields.guests },
  }));

  const uploadImage = async (id: string, blob?: Blob) => {
    const { data, error } = await executeGenerateImageUrlMutation({ id });
    if (!data || error) {
      console.log('generating event image upload url error: ', error);
      return;
    }

    await fetch(data.generateEventImageUploadUrl, { method: 'PUT', body: blob });
    await executeSetImageMutation({ id });
  };

  const createEvent = async ({ invitedIds, blob, ...args }: CreateEventPayload) => {
    setIsLoading(true);

    try {
      const { data } = await executeCreateMutation(args);
      if (!data?.createEvent) return;
      const { id } = data.createEvent;

      await Promise.all([
        blob ? uploadImage(id, blob) : null,
        invitedIds.length ? executeSetGuests({ eventId: id, userIds: invitedIds }) : null,
      ]);

      callback(id);
    } catch (error) {
      console.log('creating event error: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, createEvent };
};
