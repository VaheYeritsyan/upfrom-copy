import { useCallback, useEffect, useState } from 'react';
import { EventUser } from '@up-from/graphql/genql';
import { useTypedQuery } from '~urql';

const eventIdWithGuests = {
  id: true,
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

export const useEventDetailsQueries = (eventId: string) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [{ data, fetching, stale }, execute] = useTypedQuery({
    query: {
      event: {
        __args: { id: eventId },
        ...eventIdWithGuests,
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
        isCancelled: true,
        endsAt: true,
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
        owner: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          isDisabled: true,
        },
      },
    },
    requestPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (!isRefreshing) return;

    setIsRefreshing(fetching || stale);
  }, [fetching, stale]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    execute({ requestPolicy: 'network-only' });
  }, [execute]);

  return {
    isLoading: fetching && !data,
    isRefreshing,
    event: data?.event || null,
    team: data?.event?.team || null,
    guests: (data?.event?.guests || []) as Required<EventUser>[],
    owner: data?.event?.owner || null,
    refresh,
  };
};
