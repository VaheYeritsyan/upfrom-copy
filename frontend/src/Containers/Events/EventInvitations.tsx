import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { EventsStackParamList, Screens } from '~types/navigation';
import { EventsFilter } from '~types/event';
import { MainLayout } from '~Components/MainLayout';
import { colors } from '~Theme/Colors';
import { Header } from '~Components/ScreenHeader/Header';
import { EventCardLarge } from '~Components/EventCard/EventCardLarge';
import { getEventType } from '~utils/eventType';
import { Typography } from '~Components/Typography';
import { FullScreenLoader } from '~Components/Loader/FullScreenLoader';
import { useEventInvitationsQueries } from './hooks/useEventInvitationsQueries';
import { Divider } from '~Components/Divider';
import { EntityCard } from '~Components/EntityCard';
import { Global } from 'iconsax-react-native';
import { getMergedText, getPlural } from '~utils/textFormat';
import { Button } from '~Components/Button';
import { useEventActionsModalsContext } from '~Hooks/useEventActionsModalsContext';
import { useEventActions } from '~Hooks/useEventActions';
import { RespondToEventInvitationModal } from '~Components/Events/RespondToEventInitationModal';
import { YouAreAttendingModal } from '~Components/Events/YouAreAttendingEventModal';
import { YouAreNotAttendingModal } from '~Components/Events/YouAreNotAttendingEventModal';
import { EmptyPlaceholder } from '~Components/EmptyPlaceholder';

const imgSrc = require('~assets/images/infinity.png');

type EventInvitationsProps = BottomTabScreenProps<EventsStackParamList, Screens.EVENT_INVITATIONS>;

export const EventInvitations: FC<EventInvitationsProps> = ({ navigation }) => {
  const { isLoading, pendingInvitations, declinedInvitations } = useEventInvitationsQueries();

  const eventModals = useEventActionsModalsContext();
  const eventActions = useEventActions();

  if (isLoading) return <FullScreenLoader style={styles.container} />;

  const handleAcceptPress = async () => {
    await eventActions.acceptInvitation(eventId => {
      navigation.navigate(Screens.EVENT_DETAILS, { eventId, withCalendarModal: true });
    });
  };

  const handleJoinPress = async () => {
    await eventActions.joinEvent(eventId => {
      navigation.navigate(Screens.EVENT_DETAILS, { eventId, withCalendarModal: true });
    });
  };

  const handleEventPress = (eventId: string) => navigation.navigate(Screens.EVENT_DETAILS, { eventId });

  const handleAllTeamsEventsPress = () => {
    const state = navigation.getState();
    if (!state) return;

    const routes = [
      {
        name: Screens.EVENTS,
        params: { eventsFilter: EventsFilter.ALL_TEAMS },
      },
    ];

    navigation.dispatch(CommonActions.reset({ ...state, index: routes.length - 1, routes }));
  };

  const handlePastEventsPress = () => {
    navigation.navigate(Screens.PAST_EVENTS);
  };

  return (
    <>
      <MainLayout
        containerStyle={styles.container}
        style={styles.bodyContainer}
        header={
          <Header
            style={styles.pageHeader}
            startAdornmentStyle={styles.headerLeft}
            middleStyle={styles.headerMiddle}
            withBackTitle
            endAdornmentStyle={styles.headerRight}>
            <Typography variant="h6">Invitations</Typography>
          </Header>
        }>
        {pendingInvitations.length === 0 && <EmptyPlaceholder title="You don’t have unresponded invitations." />}

        {pendingInvitations.length > 0 && (
          <>
            <Typography variant="h4">Invitations</Typography>
            <Typography style={styles.subHeader} variant="body1Medium">
              {'You have ' + pendingInvitations.length + getPlural(' Invitation', pendingInvitations.length)}
            </Typography>
            <View style={styles.content}>
              {pendingInvitations.map((item: any, index: any) => {
                return (
                  <EventCardLarge
                    key={item.id + index}
                    eventType={getEventType(item.teamId, item.isIndividual)}
                    header={item.title}
                    teamInfo={item.teamId && item.team ? item.team : undefined}
                    date={item.startsAt}
                    location={getMergedText([item.location.locationName, item.address])}
                    attendees={item.guests}
                    imageUrl={item.imageUrl ?? undefined}
                    id={item.id}
                    onPress={handleEventPress}
                    ownerId={item.ownerId}
                  />
                );
              })}
            </View>
          </>
        )}

        {declinedInvitations.length > 0 && (
          <>
            <Divider />
            <Typography variant="h4">Cancelled Invitations</Typography>
            <View style={styles.content}>
              {declinedInvitations.map((item: any, index: any) => {
                return (
                  <EventCardLarge
                    key={item.id + index}
                    eventType={getEventType(item.teamId, item.isIndividual)}
                    header={item.title}
                    teamInfo={item.teamId && item.team ? item.team : undefined}
                    date={item.startsAt}
                    location={getMergedText([item.location.locationName, item.address])}
                    attendees={item.guests}
                    imageUrl={item.imageUrl ?? undefined}
                    id={item.id}
                    onPress={handleEventPress}
                    ownerId={item.ownerId}
                  />
                );
              })}
            </View>
          </>
        )}

        <Divider />
        <Typography variant="h4">Looking for more activities?</Typography>
        <Typography style={styles.subHeader} variant="body1Medium">
          Explore All Teams Events
        </Typography>
        <EntityCard
          name="All Teams Events"
          onPress={handleAllTeamsEventsPress}
          avatarSource={imgSrc}
          avatarType="square"
          isArrowVisible
          style={styles.allTeamsCard}>
          <View style={styles.cardBottom}>
            <Global size={14} variant="Bold" color={colors.grey500} />
            <Typography style={styles.cardBottomText} variant="body3Medium">
              2 Events
            </Typography>
          </View>
        </EntityCard>

        <Divider />
        <Button
          text="Past Events"
          color="grey"
          shape="rectangle"
          size="large"
          fullWidth
          onPress={handlePastEventsPress}
        />
      </MainLayout>

      <RespondToEventInvitationModal
        isVisible={!!eventModals.respondingEventMeta}
        onClose={() => eventModals.setRespondingEventMeta(null)}
        onAcceptPress={handleAcceptPress}
        onDeclinePress={eventActions.declineInvitation}
        isDisabled={eventActions.isRespondLoading}
      />

      <YouAreAttendingModal
        isVisible={!!eventModals.attendingEventMeta}
        onClose={() => eventModals.setAttendingEventMeta(null)}
        isAllTeamsEvent={eventModals.attendingEventMeta?.isAllTeamsEvent}
        isDisabled={eventActions.isAttendingLoading}
        onLeavePress={eventActions.leaveEvent}
      />

      <YouAreNotAttendingModal
        isVisible={!!eventModals.notAttendingEventMeta}
        onClose={() => eventModals.setNotAttendingEventMeta(null)}
        isDisabled={eventActions.isAttendingLoading}
        onJoinPress={handleJoinPress}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey100 },
  bodyContainer: { marginTop: 32, paddingHorizontal: 24 },
  content: { flex: 1, marginTop: 20, gap: 24 },
  pageHeader: {
    shadowOpacity: 0,
    elevation: 0,
  },
  headerLeft: {
    flex: 1,
  },
  headerMiddle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  headerRight: {
    flex: 1,
    paddingRight: 0,
  },
  subHeader: {
    color: colors.grey500,
    marginTop: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardBottomText: {
    color: colors.grey500,
  },
  allTeamsCard: { marginTop: 24 },
});
