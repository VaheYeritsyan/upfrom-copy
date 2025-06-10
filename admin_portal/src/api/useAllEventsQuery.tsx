import { useMemo } from 'react';
import { QueryAllEventsConnection } from '@up-from/graphql-ap/genql';
import { useTypedQuery } from '~/hooks/useTypedQuery';
import { eventFieldsWithRelations } from '~/api/queryFields';
import { getEdgesAsEvents, splitOngoingAndOtherEvents } from '~/util/event';

export const useAllEventsQuery = () => {
  const from = useMemo(() => Date.now(), []);

  const [{ data, fetching }] = useTypedQuery({
    query: {
      allEvents: {
        __args: { order: 'asc', from, includeOngoing: true },
        edges: {
          node: eventFieldsWithRelations,
        },
      },
    },
  });

  const { ongoing, other: events } = splitOngoingAndOtherEvents(
    getEdgesAsEvents(data?.allEvents as QueryAllEventsConnection),
  );

  return {
    fetching,
    events,
    ongoing,
  };
};
