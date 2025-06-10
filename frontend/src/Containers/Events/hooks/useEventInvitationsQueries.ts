import { useMemo } from 'react';
import { useTypedQuery } from '~urql';

const eventFields = {
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
};

export const useEventInvitationsQueries = () => {
  const fromDate = useMemo(Date.now, []);

  const [{ data, fetching }] = useTypedQuery({
    query: {
      teamTotalAmount: true,
      pendingEvents: {
        __args: { from: fromDate, order: 'asc', includeOngoing: false },
        edges: { node: eventFields },
        pageInfo: { hasNextPage: true, endCursor: true, startCursor: true, hasPreviousPage: true },
      },
      declinedEvents: {
        __args: { from: fromDate, order: 'asc' },
        edges: { node: eventFields },
        pageInfo: { hasNextPage: true, endCursor: true, startCursor: true, hasPreviousPage: true },
      },
    },
  });

  return {
    isLoading: fetching,
    teamsCount: data?.teamTotalAmount || 0,
    pendingInvitations: data?.pendingEvents.edges.map(({ node }) => node) || [],
    declinedInvitations: data?.declinedEvents.edges.map(({ node }) => node) || [],
  };
};
