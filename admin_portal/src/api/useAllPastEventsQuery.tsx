import { useMemo } from 'react';
import { Event } from '@up-from/graphql-ap/genql';
import { useTypedQuery } from '~/hooks/useTypedQuery';
import { eventFieldsWithRelations } from '~/api/queryFields';

export const useAllPastEventsQuery = () => {
  const to = useMemo(() => Date.now(), []);

  const [{ data, fetching }] = useTypedQuery({
    query: {
      allEvents: {
        __args: { order: 'desc', to, includeOngoing: false },
        edges: {
          node: eventFieldsWithRelations,
        },
      },
    },
  });

  return {
    fetching,
    events: (data?.allEvents.edges.map(({ node }) => node) || []) as Event[],
  };
};
