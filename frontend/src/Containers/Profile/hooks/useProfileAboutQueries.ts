import { useTypedQuery } from '~urql';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getOrganizationsFromTeams } from '~utils/organizationAndTeams';
import { Team } from '@up-from/graphql/genql';

export const useProfileAboutQueries = (userId?: string) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [{ data, fetching, stale }, execute] = useTypedQuery({
    query: {
      user: {
        __args: { id: userId! },
        id: true,
        avatarUrl: true,
        firstName: true,
        lastName: true,
        about: true,
        createdAt: true,
        teams: {
          id: true,
          name: true,
          imageUrl: true,
          organization: {
            id: true,
            name: true,
            details: true,
          },
        },
        profile: {
          gender: true,
          birthday: true,
          location: {
            locationID: true,
            locationName: true,
            lat: true,
            lng: true,
          },
        },
      },
    },
    pause: !userId,
  });

  useEffect(() => {
    if (!isRefreshing) return;

    setIsRefreshing(fetching || stale);
  }, [fetching, stale]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    execute({ requestPolicy: 'network-only' });
  }, [execute]);

  const teams = useMemo(() => {
    if (!data?.user?.teams?.length) return [];

    return data.user.teams;
  }, [data?.user?.teams]);

  const organizations = useMemo(() => {
    if (!teams.length) return [];

    return getOrganizationsFromTeams(teams as Team[]);
  }, [teams]);

  return { isLoading: fetching && !data, teams, organizations, refresh, isRefreshing, user: data?.user || null };
};
