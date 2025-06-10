import React, { ReactNode, useMemo, createContext, useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { useTypedQuery } from '~urql';
import { useChatContext } from '~Context/ChatContext';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { useForegroundEffect } from '~Hooks/useForegroundEffect';

interface IBottomNavigationBadgesContext {
  isEventsBadgeVisible: boolean;
  isMessengerBadgeVisible: boolean;
}

const invitationMessageRegExp = new RegExp(/ invit/i);

export const BottomNavigationBadgesContext = createContext<IBottomNavigationBadgesContext | null>(null);

export const BottomNavigationBadgesContextProvider = ({ children }: { children: ReactNode }) => {
  const { unreadCount } = useChatContext();
  const { currentUser } = useCurrentUserContext();

  const fromDate = useMemo(() => Date.now(), []);

  const [{ data: invitationsData }, execute] = useTypedQuery({
    query: {
      pendingEvents: {
        __args: { from: fromDate, order: 'asc', includeOngoing: false },
        edges: {
          node: {
            startsAt: true,
            imageUrl: true,
            address: true,
            location: {
              locationID: true,
              locationName: true,
              lat: true,
              lng: true,
            },
            description: true,
            isIndividual: true,
            title: true,
            endsAt: true,
            ownerId: true,
            teamId: true,
            id: true,
            team: {
              id: true,
              name: true,
              imageUrl: true,
            },
            guests: {
              isAttending: true,
              user: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
                id: true,
                isDisabled: true,
              },
            },
          },
        },
        pageInfo: { hasNextPage: true, endCursor: true, startCursor: true, hasPreviousPage: true },
      },
    },
    requestPolicy: 'cache-first',
    pause: !currentUser?.profile.isSignupCompleted || currentUser?.isDisabled,
  });

  useEffect(() => {
    if (!currentUser?.profile.isSignupCompleted || currentUser.isDisabled) return;

    messaging().onMessage(async remoteMessage => {
      if (!remoteMessage.data?.eventId || !invitationMessageRegExp.test(remoteMessage.notification?.body || '')) return;

      execute({ requestPolicy: 'network-only' });
    });
  }, [currentUser]);

  useForegroundEffect(() => {
    if (currentUser?.profile.isSignupCompleted && !currentUser.isDisabled) {
      execute({ requestPolicy: 'cache-and-network' });
    }
  });

  const contextValue: IBottomNavigationBadgesContext = useMemo(() => {
    return {
      isEventsBadgeVisible: !!invitationsData?.pendingEvents.edges.length,
      isMessengerBadgeVisible: !!unreadCount,
    };
  }, [unreadCount, invitationsData?.pendingEvents.edges.length]);

  return (
    <BottomNavigationBadgesContext.Provider value={contextValue}>{children}</BottomNavigationBadgesContext.Provider>
  );
};
