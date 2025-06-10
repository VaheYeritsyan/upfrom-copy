import { Client, errorExchange, fetchExchange, Exchange } from '@urql/core';
import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';
import Config from 'react-native-config';
import { useMemo } from 'react';
import { Event } from '@up-from/graphql/genql';
import { useAuthContext } from '~Hooks/useAuthContext';
import { showAlert } from '~utils/toasts';
import { addEventToQueries, removeEventFromQueries } from '~utils/cache';
import { getEventType } from '~utils/eventType';
import { EventType } from '~types/event';
import { relayPagination } from '@urql/exchange-graphcache/extras';
import { validateAppMinVersion } from '~utils/appVersion';

export const useGraphQLClient = () => {
  const { token, signOut, setIsNeedToUpdate } = useAuthContext();

  const client = useMemo(() => {
    return new Client({
      url: `${Config.API_URL}/graphql`,
      requestPolicy: token ? 'cache-and-network' : 'cache-only',
      exchanges: [
        errorExchange({
          onError: error => {
            const isUpdateNeeded = validateAppMinVersion(error.response.headers);
            if (isUpdateNeeded) {
              console.log('HERE', isUpdateNeeded);
              setIsNeedToUpdate(true);
            } else {
              error.graphQLErrors.forEach(errorItem => {
                // TODO: Remove the check for hardcoded error when soft delete is added on BE.
                if (errorItem.message && errorItem.message !== 'Failed to find event') {
                  showAlert(errorItem.message);
                }
              });
            }
          },
        }),
        cacheExchange({
          resolvers: {
            Query: {
              yourEvents: relayPagination({ mergeMode: 'outwards' }),
              teamEvents: relayPagination({ mergeMode: 'outwards' }),
              allTeamEvents: relayPagination({ mergeMode: 'outwards' }),
              pendingEvents: relayPagination({ mergeMode: 'outwards' }),
              declinedEvents: relayPagination({ mergeMode: 'outwards' }),
              searchEvent: relayPagination({ mergeMode: 'outwards' }),
            },
          },
          keys: {
            User: ({ id }) => id as string,
            Team: ({ id }) => id as string,
            Event: ({ id }) => id as string,
            EventUser: () => null,
            UserNotificationPreferences: () => null,
            LocationType: () => null,
            TeamUser: () => null,
            UserProfile: () => null,
          },
          updates: {
            Mutation: {
              createEvent(result, args, cache, _info) {
                const event = result.createEvent as Event;
                const eventType = getEventType(event?.teamId as string, event?.isIndividual);
                addEventToQueries(cache, 'yourEvents', event);
                if (eventType === EventType.ALL_TEAMS) {
                  addEventToQueries(cache, 'allTeamEvents', event);
                } else {
                  addEventToQueries(cache, 'teamEvents', event);
                }
              },
              cancelEvent(result, _args, cache, _info) {
                const event = result.cancelEvent as Pick<Event, 'id' | 'teamId' | 'isIndividual'>;
                const eventType = getEventType(event?.teamId as string, event?.isIndividual);
                const fieldName = eventType === EventType.ALL_TEAMS ? 'allTeamEvents' : 'teamEvents';

                removeEventFromQueries(cache, 'yourEvents', event.id);
                removeEventFromQueries(cache, 'searchEvent', event.id);
                removeEventFromQueries(cache, fieldName, event.id);
              },
              joinAllTeamsEvent(result, args, cache, _info) {
                const event = result.joinAllTeamsEvent as Event;
                addEventToQueries(cache, 'yourEvents', event);
              },
              leaveAllTeamsEvent(result, args, cache, _info) {
                const event = result.leaveAllTeamsEvent as Event;
                removeEventFromQueries(cache, 'yourEvents', event.id);
              },
              updateMyInvitation(result, { isAttending }, cache, _info) {
                const event = result.updateMyInvitation as Event;
                if (isAttending) {
                  addEventToQueries(cache, 'yourEvents', event);
                  removeEventFromQueries(cache, 'pendingEvents', event.id);
                  removeEventFromQueries(cache, 'declinedEvents', event.id);
                } else {
                  removeEventFromQueries(cache, 'yourEvents', event.id);

                  if (typeof isAttending !== 'boolean') {
                    addEventToQueries(cache, 'pendingEvents', event);
                  } else {
                    removeEventFromQueries(cache, 'pendingEvents', event.id);
                    addEventToQueries(cache, 'declinedEvents', event);
                  }
                }
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
            didAuthError(error, _operation) {
              return error.graphQLErrors.some(e => e.extensions?.code === 'FORBIDDEN');
            },
            async refreshAuth() {
              signOut();
            },
          };
        }) as unknown as Exchange,
        fetchExchange,
      ],
    });
  }, [token, signOut]);

  return client;
};
