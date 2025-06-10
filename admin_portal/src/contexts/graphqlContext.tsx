import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';
import { FC, PropsWithChildren, useMemo } from 'react';
import { Client, Exchange, errorExchange, fetchExchange } from '@urql/core';
import { Provider as GqlProvider } from 'urql';
import { API_URL } from '~/constants/config';
import { useAuthContext } from '~/contexts/authContext';
import { useToast } from '~/hooks/useToast';

export const GraphqlContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const toast = useToast();
  const { token, logOut } = useAuthContext();

  const client = useMemo(() => {
    return new Client({
      url: `${API_URL}/graphql`,
      exchanges: [
        errorExchange({
          onError: error => {
            error.graphQLErrors.forEach(errorItem => {
              toast.showError(errorItem.message);
            });
          },
        }),
        cacheExchange({
          keys: {
            User: ({ id }) => id as string,
            Team: ({ id }) => id as string,
            Event: ({ id }) => id as string,
            Admin: ({ id }) => id as string,
            EventUser: ({ userId, eventId }) => `${userId}-${eventId}` as string,
            EventUserAttendance: () => null,
            TeamUser: () => null,
            LocationType: ({ locationID }) => locationID as string,
          },
          updates: {
            Mutation: {
              createAdmin(result, _args, cache) {
                const admins = cache.resolve('Query', 'allAdmins');
                cache.link('Query', 'allAdmins', [result.createAdmin, ...(Array.isArray(admins) ? admins : [])]);
              },
              createTeam(result, _args, cache) {
                const teams = cache.resolve('Query', 'allTeams');
                cache.link('Query', 'allTeams', [result.createTeam, ...(Array.isArray(teams) ? teams : [])]);
              },
              createOrganization(result, _args, cache) {
                const organizations = cache.resolve('Query', 'allOrganizations');
                cache.link('Query', 'allOrganizations', [
                  result.createOrganization,
                  ...(Array.isArray(organizations) ? organizations : []),
                ]);

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const organization = result.createOrganization.organization;
                if (!organization) return;
                cache.link('Query', 'organization', { id: organization.id as string }, organization);
              },
              removeOrganization(_result, args, cache) {
                cache.invalidate({
                  __typename: 'Organization',
                  id: args.id as string,
                });
              },
              createUser(result, _args, cache) {
                const user = result.createUser;
                if (!user) return;
                const users = cache.resolve('Query', 'allUsers');
                cache.link('Query', 'allUsers', [user, ...(Array.isArray(users) ? users : [])]);

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const team = user?.team;
                if (!team) return;
                cache.link('Query', 'team', { id: team.id as string }, team);
              },
            },
          },
        }),
        authExchange(async utils => {
          return {
            addAuthToOperation(operation) {
              if (!token) return operation;

              return utils.appendHeaders(operation, { Authorization: `Bearer ${token}` });
            },
            didAuthError(error) {
              return error.graphQLErrors.some(e => e.extensions?.code === 'FORBIDDEN');
            },
            async refreshAuth() {
              logOut();
            },
          };
        }) as Exchange,
        fetchExchange,
      ],
    });
  }, [token, logOut]);

  return <GqlProvider value={client}>{children}</GqlProvider>;
};
