import { Event } from '@up-from/graphql-ap/genql';
import { useTypedQuery } from '~/hooks/useTypedQuery';
import {
  eventFieldsWithTeamRelations,
  eventUserFieldsWithRelations,
  teamFieldsWithRelations,
  teamUserFieldsWithRelations,
  userFieldsWithRelations,
} from './queryFields';

export const useEventByIDQuery = (userId: string) => {
  const [{ data, fetching }] = useTypedQuery({
    query: {
      event: {
        __args: { id: userId },
        ...eventFieldsWithTeamRelations,
        guests: { ...eventUserFieldsWithRelations, user: userFieldsWithRelations },
        team: {
          ...teamFieldsWithRelations,
          members: teamUserFieldsWithRelations,
        },
      },
    },
  });

  return {
    fetching,
    event: data?.event as Event,
  };
};
