import { useState } from 'react';
import { useTypedMutation } from '~/hooks/useTypedMutation';
import { MutationGenqlSelection, User } from '@up-from/graphql-ap/genql';
import { useToast } from '~/hooks/useToast';
import { getNotificationSuccessMessageInPlural } from '~/util/text';
import { eventFieldsWithRelations } from '~/api/queryFields';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type CancelEventArgs = MutationGenqlSelection['cancelEvent']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type RestoreEventArgs = MutationGenqlSelection['restoreEvent']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type CreateEventArgs = MutationGenqlSelection['createEvent']['__args'] & {
  attendees?: User[];
  image?: Blob;
};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type CreateEventUserArgs = MutationGenqlSelection['createEventUser']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type GenerateEventImageArgs = MutationGenqlSelection['generateEventImageUploadUrl']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type CompleteEventImageUploadArgs = MutationGenqlSelection['completeEventImageUpload']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type RemoveEventImageArgs = MutationGenqlSelection['removeEventImage']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type UpdateEventArgs = MutationGenqlSelection['updateEvent']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type SetEventGuestsArgs = MutationGenqlSelection['setEventGuests']['__args'];

export const useEventMutations = () => {
  const toast = useToast();

  const [isCreateEventLoading, setIsCreateEventLoading] = useState(false);
  const [isEventImageLoading, setIsEventImageLoading] = useState(false);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const [createData, executeCreateEvent] = useTypedMutation((args: CreateEventArgs) => ({
    createEvent: { __args: args, ...eventFieldsWithRelations },
  }));

  const [, executeCreateEventUser] = useTypedMutation((args: CreateEventUserArgs) => ({
    createEventUser: { __args: args, ...eventFieldsWithRelations },
  }));

  const [cancelData, executeCancelEvent] = useTypedMutation((args: CancelEventArgs) => ({
    cancelEvent: { __args: args, id: true, isCancelled: true, updatedAt: true },
  }));

  const [setEventGuestsData, executeSetEventGuests] = useTypedMutation((args: SetEventGuestsArgs) => ({
    setEventGuests: { __args: args, ...eventFieldsWithRelations },
  }));

  const [updateData, executeUpdateEvent] = useTypedMutation((args: UpdateEventArgs) => ({
    updateEvent: {
      __args: args,
      address: true,
      description: true,
      endsAt: true,
      id: true,
      imageUrl: true,
      isCancelled: true,
      isIndividual: true,
      location: {
        locationID: true,
        locationName: true,
        lat: true,
        lng: true,
      },
      ownerId: true,
      startsAt: true,
      teamId: true,
      title: true,
    },
  }));

  const [restoreData, executeRestoreEvent] = useTypedMutation((args: RestoreEventArgs) => ({
    restoreEvent: { __args: args, id: true, isCancelled: true, updatedAt: true },
  }));

  const [, executeGenerateImageUrl] = useTypedMutation((args: GenerateEventImageArgs) => ({
    generateEventImageUploadUrl: { __args: args },
  }));

  const [, executeCompleteImageUpload] = useTypedMutation((args: CompleteEventImageUploadArgs) => ({
    completeEventImageUpload: { __args: args, id: true, imageUrl: true },
  }));

  const [removeImageData, executeRemoveImage] = useTypedMutation((args: RemoveEventImageArgs) => ({
    removeEventImage: { __args: args, id: true, imageUrl: true },
  }));

  const uploadImage = async (id: string, blob: Blob) => {
    setIsEventImageLoading(true);
    const { data, error, ...rest } = await executeGenerateImageUrl({ id });
    if (!data || error) {
      console.log('generating event image upload url error: ', error);
      return { data, error, ...rest };
    }

    await fetch(data.generateEventImageUploadUrl, { method: 'PUT', body: blob });
    const res = await executeCompleteImageUpload({ id });
    setIsEventImageLoading(false);

    return res;
  };

  const removeImage = async (id: string) => {
    const { data, error, ...rest } = await executeRemoveImage({ id });
    if (!data || error) {
      console.log('generating event image upload url error: ', error);
    }

    return { data, error, ...rest };
  };

  const create = async ({ attendees, image, ...args }: CreateEventArgs, callback?: () => void) => {
    setIsCreateEventLoading(true);

    try {
      const { data } = await executeCreateEvent(args);
      const event = data?.createEvent;
      if (!event) return;

      const attendeesMutations = (attendees as User[])?.map(({ id }) =>
        executeCreateEventUser({ isAttending: null, userId: id, eventId: event.id }),
      );

      const results = await Promise.all([...attendeesMutations, ...(image ? [uploadImage(event.id, image)] : [])]);

      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(`The "${args.title}" event has been successfully created`);
        callback?.();
      }
    } catch (e) {
      toast.showError('Something went wrong');
    } finally {
      setIsCreateEventLoading(false);
    }
  };

  const setGuests = async (args: SetEventGuestsArgs, callback?: () => void) => {
    try {
      const { data } = await executeSetEventGuests(args);
      if (!data) return;
      toast.showSuccess(getNotificationSuccessMessageInPlural(args.userIds.length, 'guest', 'been successfully set'));
      callback?.();
    } catch (e) {
      toast.showError('Something went wrong');
    }
  };

  const update = async (event: UpdateEventArgs) => {
    try {
      const mutation = executeUpdateEvent(event);
      const result = await Promise.resolve(mutation);
      if (!result.error) {
        toast.showSuccess('Event has been successfully updated');
      }
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  const cancelAll = async (ids: CancelEventArgs['id'][]) => {
    setLoadingIds(ids);
    try {
      const mutations = ids.map(id => executeCancelEvent({ id }));

      const results = await Promise.all(mutations);
      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(getNotificationSuccessMessageInPlural(ids.length, 'event', 'been successfully cancelled'));
      }
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  const restoreAll = async (ids: RestoreEventArgs['id'][]) => {
    setLoadingIds(ids);
    try {
      const mutations = ids.map(id => executeRestoreEvent({ id }));

      const results = await Promise.all(mutations);
      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(getNotificationSuccessMessageInPlural(ids.length, 'event', 'been successfully restored'));
      }
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  return {
    loadingIds,
    createEvent: {
      data: createData,
      fetching: isCreateEventLoading || isEventImageLoading,
      create,
    },
    cancelEvent: {
      data: cancelData.data?.cancelEvent,
      fetching: cancelData.fetching,
      cancel: executeCancelEvent,
      cancelAll,
    },
    setEventGuests: {
      data: setEventGuestsData.data?.setEventGuests,
      fetching: setEventGuestsData.fetching,
      setGuests,
    },
    restoreEvent: {
      data: restoreData.data?.restoreEvent,
      fetching: restoreData.fetching,
      restore: executeRestoreEvent,
      restoreAll,
    },
    uploadImage: {
      fetching: isEventImageLoading,
      upload: uploadImage,
    },
    removeImage: {
      fetching: removeImageData.fetching,
      remove: removeImage,
    },
    updateEvent: {
      data: updateData.data?.updateEvent,
      fetching: updateData.fetching,
      update,
    },
  };
};
