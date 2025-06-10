import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTypedQuery } from '~urql';
import { getOrganizationsFromTeams } from '~utils/organizationAndTeams';
import { Team } from '@up-from/graphql/genql';

export const useTeamsQueries = () => {
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
        myMembership: {
          role: true,
        },
        organization: {
          id: true,
          name: true,
          details: true,
        },
      },
    },
  });

  useEffect(() => {
    if (!isRefreshing) return;

    setIsRefreshing(fetching || stale);
  }, [fetching, stale]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    execute({ requestPolicy: 'network-only' });
  }, [execute]);

  const organizations = useMemo(() => {
    if (!data?.myTeams?.length) return [];

    return getOrganizationsFromTeams(data?.myTeams as Team[]);
  }, [data?.myTeams]);

  return {
    isLoading: fetching && !data,
    isRefreshing,
    teams: data?.myTeams || [],
    organizations,
    refresh,
  };
};
