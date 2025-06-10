import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTypedQuery } from '~urql';

export const useEventsQueries = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentDate = useMemo(Date.now, []);

  const [{ data, stale, fetching }, execute] = useTypedQuery({
    query: {
      pendingEvents: {
        __args: { from: currentDate, order: 'asc', includeOngoing: false },
        edges: {
          node: {
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
          },
        },
        pageInfo: { hasNextPage: true, endCursor: true, startCursor: true, hasPreviousPage: true },
      },
    },
  });

  useEffect(() => {
    if (!isRefreshing) return;

    setIsRefreshing(fetching || stale);
  }, [fetching, stale]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    execute({ requestPolicy: 'network-only' });
  }, [execute]);

  return {
    isLoading: fetching && !data,
    isRefreshing,
    refresh,
    invitations: data?.pendingEvents.edges.map(({ node }) => node) || [],
  };
};
