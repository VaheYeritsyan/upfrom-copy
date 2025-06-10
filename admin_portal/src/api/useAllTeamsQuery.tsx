import { Team } from '@up-from/graphql-ap/genql';
import { useTypedQuery } from '~/hooks/useTypedQuery';
import { teamFieldsWithRelations, teamUserFieldsWithRelations } from '~/api/queryFields';

export const useAllTeamsQuery = () => {
  const [{ data, fetching }] = useTypedQuery({
    query: {
      allTeams: { ...teamFieldsWithRelations, members: teamUserFieldsWithRelations },
    },
  });

  return {
    fetching,
    teams: (data?.allTeams || []) as Team[],
  };
};
