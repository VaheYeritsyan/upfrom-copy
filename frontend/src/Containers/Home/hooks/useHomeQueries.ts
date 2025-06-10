import { useCallback, useEffect, useMemo, useState } from 'react';
import { Team } from '@up-from/graphql/genql';
import { useTypedQuery } from '~urql';
import { getOrganizationsMembersFromTeams } from '~utils/organizationAndTeams';

export const useHomeQueries = (pause?: boolean) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fromDate = useMemo(Date.now, []);

  const [{ data, stale, fetching, operation }, execute] = useTypedQuery({
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
            createdAt: true,
          },
        },
        organization: {
          id: true,
          name: true,
          details: true,
        },
      },
      yourEvents: {
        __args: { from: fromDate, first: 5, order: 'asc', includeOngoing: true },
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
          hasPreviousPage: true,
          startCursor: true,
        },
      },
      pendingEvents: {
        __args: { from: fromDate, order: 'asc', includeOngoing: false },
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
          hasPreviousPage: true,
          startCursor: true,
        },
      },
    },
    pause,
  });

  useEffect(() => {
    if (!isRefreshing) return;

    setIsRefreshing(fetching || stale);
  }, [fetching, stale]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    execute({ requestPolicy: 'network-only' });
  }, [execute]);

  const members = useMemo(() => {
    if (!data?.myTeams.length) return [];

    return getOrganizationsMembersFromTeams(data?.myTeams as Team[]);
  }, [data?.myTeams]);

  return {
    isLoading: fetching && !data,
    isLoaded: !!operation,
    teams: data?.myTeams || ([] as Team[]),
    members,
    refresh,
    isRefreshing,
    events: [...(data?.yourEvents.edges.map(({ node }) => node) || [])].splice(0, 5),
    invitations: data?.pendingEvents.edges.map(({ node }) => node) || [],
  };
};
