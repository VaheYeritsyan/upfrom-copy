import { useTypedQuery } from '~/hooks/useTypedQuery';
import { userAttendanceFieldsWithRelations } from '~/api/queryFields';
import { UserWithAttendance } from '~/types/eventUsers';

export const useTopUsersQuery = (from?: number, to?: number) => {
  const [{ data, fetching }] = useTypedQuery({
    query: {
      getUserAttendance: {
        __args: { from, to },
        ...userAttendanceFieldsWithRelations,
      },
    },
  });

  const users = (data?.getUserAttendance.map(item => ({
    ...item,
    ...item.user,
    id: item.userId,
  })) || []) as unknown as UserWithAttendance[];

  return {
    fetching,
    users,
  };
};
