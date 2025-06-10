import { useCallback, useEffect, useState } from 'react';
import { Team } from '@up-from/graphql/genql';
import { useTypedQuery } from '~urql';

export const useEventAssigneesQueries = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [{ data, fetching, stale }, execute] = useTypedQuery({
    query: {
      myTeams: {
        id: true,
        name: true,
        imageUrl: true,
        members: {
          role: true,
          user: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        organization: {
          id: true,
          name: true,
          details: true,
        },
      },
      teamTotalAmount: true,
    },
  });

  useEffect(() => {
    if (!isRefreshing) return;

    setIsRefreshing(fetching || stale);
  }, [fetching, stale, isRefreshing]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    execute({ requestPolicy: 'network-only' });
  }, [execute]);

  return {
    isLoading: fetching && !data,
    isRefreshing,
    teams: (data?.myTeams || []) as Team[],
    allTeamsCount: data?.teamTotalAmount ?? 0,
    refresh,
  };
};
