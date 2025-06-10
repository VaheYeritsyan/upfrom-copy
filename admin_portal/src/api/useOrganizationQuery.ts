import { Organization } from '@up-from/graphql-ap/genql';
import { useTypedQuery } from '~/hooks/useTypedQuery';
import {
  organizationsFieldsWithRelations,
  teamFieldsWithRelations,
  teamUserFields,
  userFieldsWithRelations,
} from './queryFields';

export const useOrganizationQuery = (id?: string) => {
  const [{ data, fetching }] = useTypedQuery({
    query: {
      organization: {
        __args: { id: id! },
        ...organizationsFieldsWithRelations,
        teams: {
          ...teamFieldsWithRelations,
          members: {
            ...teamUserFields,
            user: userFieldsWithRelations,
          },
        },
      },
    },
    pause: !id,
  });

  return {
    fetching,
    organization: (data?.organization as Organization) || null,
  };
};
