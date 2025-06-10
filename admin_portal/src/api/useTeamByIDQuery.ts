import { Team } from '@up-from/graphql-ap/genql';
import { useTypedQuery } from '~/hooks/useTypedQuery';
import {
  eventFieldsWithRelations,
  organizationsFields,
  teamFieldsWithRelations,
  teamUserFieldsWithRelations,
  userFieldsWithRelations,
} from './queryFields';

export const useTeamByIDQuery = (teamId: string) => {
  const [{ data, fetching }] = useTypedQuery({
    query: {
      team: {
        __args: { id: teamId },
        ...teamFieldsWithRelations,
        members: { ...teamUserFieldsWithRelations, user: userFieldsWithRelations },
        events: eventFieldsWithRelations,
        organization: {
          ...organizationsFields,
          teams: {
            id: true,
          },
        },
      },
    },
  });

  return {
    fetching,
    team: data?.team as Team,
  };
};
