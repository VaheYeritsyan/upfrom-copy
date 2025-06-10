import React, { ReactNode, useMemo, createContext, useEffect } from 'react';
import { User, Team, UserNotificationPreferences, Organization, TeamUser, UserProfile } from '@up-from/graphql/genql';
import { useTypedQuery } from '~urql';
import { useAuthContext } from '~Hooks/useAuthContext';
import { GQLLocationType } from '~types/location';

type CurrentUser = Pick<User, 'avatarUrl' | 'firstName' | 'lastName' | 'id' | 'about' | 'isDisabled'> & {
  notificationPreferences?: Omit<UserNotificationPreferences, 'userId' | '__typename'>;
  profile: UserProfile & {
    location?: GQLLocationType;
  };
  teams?: (Pick<Team, 'id' | 'name' | 'imageUrl'> & {
    members: TeamUser[];
    organization: Pick<Organization, 'id' | 'name' | 'details'>;
  })[];
};

interface ICurrentUserContext {
  currentUser: CurrentUser | null;
  isLoading: boolean;
  refresh: () => void;
}

export const CurrentUserContext = createContext<ICurrentUserContext | null>(null);

export const CurrentUserContextProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuthContext();

  const [{ data, fetching }, executeQuery] = useTypedQuery({
    query: {
      currentUser: {
        avatarUrl: true,
        firstName: true,
        lastName: true,
        id: true,
        about: true,
        isDisabled: true,
        teams: {
          id: true,
          name: true,
          imageUrl: true,
          members: {
            role: true,
            user: {
              id: true,
            },
          },
          organization: {
            id: true,
            name: true,
            details: true,
          },
          myMembership: {
            role: true,
          },
        },
        profile: {
          isSignupCompleted: true,
          gender: true,
          phone: true,
          email: true,
          birthday: true,
          location: {
            locationID: true,
            locationName: true,
            lat: true,
            lng: true,
          },
        },
        notificationPreferences: {
          emailChatNewMessage: true,
          emailEventPendingInvitation: true,
          pushChatNewMessage: true,
          pushTeamNewMember: true,
          pushEventCancelled: true,
          pushEventNewAllTeam: true,
          pushEventNewInvitation: true,
          pushEventRemovedIndividual: true,
          pushEventUpdatedDateTime: true,
          pushEventUpdatedLocation: true,
        },
      },
    },
  });

  useEffect(() => {
    if (!token) return;

    executeQuery();
  }, [token]);

  const currentUser = useMemo(() => {
    if (!token) return null;

    return (data?.currentUser as unknown as CurrentUser) || null;
  }, [data?.currentUser, token]);

  const contextValue = useMemo(
    () => ({
      currentUser,
      isLoading: !currentUser && fetching,
      refresh: executeQuery,
    }),
    [currentUser, fetching, executeQuery],
  );

  return <CurrentUserContext.Provider value={contextValue}>{children}</CurrentUserContext.Provider>;
};
