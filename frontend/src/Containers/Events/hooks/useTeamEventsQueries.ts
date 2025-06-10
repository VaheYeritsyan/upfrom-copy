import { useTypedQuery } from '~urql';
import { useEffect, useState } from 'react';

export const useTeamEventsQueries = (
  isPause: boolean,
  fromDate?: string | number | Date,
  toDate?: string | number | Date,
  inverted?: boolean,
  includeOngoing?: boolean,
) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  const [{ data, fetching, stale }, execute] = useTypedQuery({
    query: {
      teamEvents: {
        __args: {
          includeOngoing: includeOngoing || false,
          from: fromDate,
          to: toDate,
          order: inverted ? 'desc' : 'asc',
          first: 5,
          after: cursor,
        },
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
          },
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
          startCursor: true,
          hasPreviousPage: true,
        },
      },
    },
    pause: isPause,
  });

  useEffect(() => {
    setIsLoadingMore(!!cursor);
  }, [cursor]);

  useEffect(() => {
    if (!isRefreshing) return;

    setIsRefreshing(fetching || stale);
  }, [fetching, stale]);

  useEffect(() => {
    setCursor(null);
  }, [fromDate, toDate]);

  useEffect(() => {
    if (!isLoadingMore || fetching) return;

    setIsLoadingMore(fetching);
  }, [fetching]);

  const loadMore = () => {
    const pageInfo = data?.teamEvents.pageInfo;
    const hasNext = pageInfo?.hasNextPage;
    const nextCursor = pageInfo?.endCursor;
    if (!hasNext || !nextCursor || fetching || isLoadingMore) return;

    setCursor(nextCursor);
  };

  const refresh = () => {
    if (isPause) return;

    setIsRefreshing(true);
    setCursor(null);
    execute({ requestPolicy: 'network-only' });
  };

  return {
    isLoadingTeamEvents: fetching && !isLoadingMore && !isRefreshing,
    hasNextPage: data?.teamEvents.pageInfo.hasNextPage,
    loadMore,
    refresh,
    isLoadingMore,
    isRefreshing,
    teamEvents: data?.teamEvents.edges.map(({ node }) => node) || [],
  };
};
