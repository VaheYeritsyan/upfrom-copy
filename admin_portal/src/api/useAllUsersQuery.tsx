import { useTypedQuery } from '~/hooks/useTypedQuery';
import { userFieldsWithRelations } from '~/api/queryFields';
import { User } from '@up-from/graphql-ap/genql';

export const useAllUsersQuery = () => {
  const [{ data, fetching }] = useTypedQuery({
    query: { allUsers: userFieldsWithRelations },
  });

  return {
    fetching,
    users: (data?.allUsers || []) as User[],
  };
};
