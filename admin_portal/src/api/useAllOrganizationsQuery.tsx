import { useTypedQuery } from '~/hooks/useTypedQuery';
import {
  organizationsFieldsWithRelations,
  teamFieldsWithRelations,
  teamUserFieldsWithRelations,
} from '~/api/queryFields';
import { Organization } from '@up-from/graphql-ap/genql';

export const useAllOrganizationsQuery = () => {
  const [{ data, fetching }] = useTypedQuery({
    query: {
      allOrganizations: {
        ...organizationsFieldsWithRelations,
        teams: { ...teamFieldsWithRelations, members: teamUserFieldsWithRelations },
      },
    },
  });

  return {
    fetching,
    organizations: (data?.allOrganizations as Organization[]) || [],
  };
};
