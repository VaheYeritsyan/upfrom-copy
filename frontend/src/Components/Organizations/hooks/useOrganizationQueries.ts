import { useCallback, useEffect, useState } from 'react';
import { useTypedQuery } from '~urql';

export const useOrganizationQueries = (organizationId?: string) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [{ data, fetching, stale }, execute] = useTypedQuery({
    query: {
      organization: {
        __args: { id: organizationId! },
        id: true,
        name: true,
        details: true,
        teams: {
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
        },
      },
    },
    pause: !organizationId,
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
    isLoading: fetching && data?.organization.id !== organizationId,
    isRefreshing,
    teams: data?.organization?.teams || [],
    organization: data?.organization,
    refresh,
  };
};
