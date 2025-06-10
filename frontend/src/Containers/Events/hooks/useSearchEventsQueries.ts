import { useEffect, useState } from 'react';
import { useTypedQuery } from '~urql';
import { useDebounce } from '~Hooks/useDebouce';

export const useSearchEventsQueries = (query: string) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query);

  const [{ data, fetching }, execute] = useTypedQuery({
    query: {
      searchEvent: {
        __args: { searchString: debouncedQuery, first: 10, after: cursor! },
        edges: {
          node: {
            startsAt: true,
            endsAt: true,
            imageUrl: true,
            title: true,
            teamId: true,
            id: true,
            team: {
              id: true,
              name: true,
              imageUrl: true,
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
  });

  useEffect(() => {
    setIsLoadingMore(!!cursor);
  }, [cursor]);

  useEffect(() => {
    setCursor(null);
  }, [debouncedQuery]);

  useEffect(() => {
    if (!isLoadingMore || fetching) return;

    setIsLoadingMore(fetching);
  }, [fetching]);

  const loadMore = () => {
    const pageInfo = data?.searchEvent.pageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo?.endCursor) return;

    setCursor(pageInfo.endCursor);
  };

  useEffect(() => {
    execute({ requestPolicy: 'network-only' });
  }, [debouncedQuery]);

  return {
    isLoading: fetching && !isLoadingMore,
    hasNextPage: data?.searchEvent.pageInfo.hasNextPage,
    isLoadingMore,
    loadMore,
    events: data?.searchEvent.edges.map(({ node }) => node) || [],
  };
};
