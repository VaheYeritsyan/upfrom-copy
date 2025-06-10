import { Admin } from '@up-from/graphql-ap/genql';
import { useTypedQuery } from '~/hooks/useTypedQuery';
import { adminFields } from '~/api/queryFields';

export const useAllAdminsQuery = () => {
  const [{ data, fetching }] = useTypedQuery({
    query: {
      allAdmins: adminFields,
    },
  });

  return {
    fetching,
    admins: (data?.allAdmins || []) as Admin[],
  };
};
