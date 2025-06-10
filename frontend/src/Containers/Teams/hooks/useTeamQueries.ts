import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTypedQuery } from '~urql';
import { Organization, TeamUser } from '@up-from/graphql/genql';

export const useTeamQueries = (teamId?: string) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [{ data, fetching, stale }, execute] = useTypedQuery({
    query: {
      team: {
        __args: { id: teamId! },
        description: true,
        id: true,
        name: true,
        imageUrl: true,
        createdAt: true,
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
        },
        myMembership: {
          role: true,
        },
      },
    },
    pause: !teamId,
  });

  const team = useMemo(() => data?.team || null, [data?.team]);

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
    team,
    members: (team?.members || []) as TeamUser[],
    organization: (data?.team?.organization as Organization) || null,
    refresh,
  };
};
