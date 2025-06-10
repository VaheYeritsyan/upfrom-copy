import { User } from '@up-from/graphql-ap/genql';
import { useTypedQuery } from '~/hooks/useTypedQuery';
import {
  eventFieldsWithRelations,
  teamFieldsWithRelations,
  teamUserFieldsWithRelations,
  userFieldsWithRelations,
} from './queryFields';

export const useUserProfileByIDQuery = (userId: string) => {
  const [{ data, fetching }] = useTypedQuery({
    query: {
      user: {
        __args: { id: userId },
        ...userFieldsWithRelations,
        teams: { ...teamFieldsWithRelations, members: teamUserFieldsWithRelations },
        events: eventFieldsWithRelations,
      },
    },
  });

  return {
    fetching,
    user: data?.user as User,
  };
};
