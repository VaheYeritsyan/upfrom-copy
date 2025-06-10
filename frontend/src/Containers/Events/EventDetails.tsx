import React, { FC, useCallback, useMemo } from 'react';
import { Dimensions, Platform, StyleSheet, View, InteractionManager } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  Apple,
  ArrowRight2,
  Calendar,
  Clock,
  Edit,
  Global,
  Google,
  Location,
  MenuBoard,
  Trash,
} from 'iconsax-react-native';
import { EventsStackParamList, Screens } from '~types/navigation';
import { EventType } from '~types/event';
import { MainLayout } from '~Components/MainLayout';
import { HeaderBackButton, headerBackButtonContainerStyles } from '~Components/ScreenHeader/HeaderBackButton';
import { useEventDetailsQueries } from '~Containers/Events/hooks/useEventDetailsQueries';
import { FullScreenLoader } from '~Components/Loader/FullScreenLoader';
import { addTodayToDateString, getFullTextDateTime, getIsDateToday, getMonthDayAndYear } from '~utils/dateFormat';
import { Typography } from '~Components/Typography';
import { EntityInfo } from '~Components/EntityInfo';
import { TruncatedText } from '~Components/TruncatedText';
import { Divider } from '~Components/Divider';
import { Feature } from '~Components/Feature';
import { Button } from '~Components/Button';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { getEventType } from '~utils/eventType';
import { EventGuests } from '~Components/Events/EventGuests';
import { EntityCard } from '~Components/EntityCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventTypeIcon } from '~Components/Events/EventTypeIcon';
import { colors } from '~Theme/Colors';
import { effects } from '~Theme/Effects';
import { Image } from '~Components/Image/Image';
import { useRemoveEventQueries } from '~Containers/Events/hooks/useRemoveEvent';
import { DeleteEventConfirmation } from '~Components/Events/DeleteEventConfiramtionModal';
import { AddEventToCalendarModal } from '~Components/Events/AddEventToCalendarModal';
import { useCalendarEvent } from '~Containers/Events/hooks/useCalendarEvent';
import { RespondToEventInvitationModal } from '~Components/Events/RespondToEventInitationModal';
import { YouAreAttendingModal } from '~Components/Events/YouAreAttendingEventModal';
import { YouAreNotAttendingModal } from '~Components/Events/YouAreNotAttendingEventModal';
import { useEventActions } from '~Hooks/useEventActions';
import { EventButton } from '~Components/Events/EventButton';
import { useEventActionsModalsContext } from '~Hooks/useEventActionsModalsContext';
import { saveEventToAppCalendar } from '~utils/calendar';
import { handleDirectionsPress } from '~utils/links';
import { Badge } from '~Components/Badge';
import { getAvatarImageOrganizationBadge } from '~Components/Avatar/avatarImageOrganizationBadge';

const allTeamImgSrc = require('~assets/images/infinity.png');
const imagePlaceholderSrc = require('~assets/images/placeholderImage.png');

type EventDetailsProps = BottomTabScreenProps<EventsStackParamList, Screens.EVENT_DETAILS>;

const isIOS = Platform.OS === 'ios';
const headerImageHeight = 300;
const SystemCalendarIcon = isIOS ? Apple : Google;

const eventTypeValues = {
  [EventType.INDIVIDUAL]: 'Individual Event',
  [EventType.MY_TEAM]: 'Team Event',
  [EventType.ALL_TEAMS]: 'All Teams Event',
};

export const EventDetails: FC<EventDetailsProps> = ({ navigation, route }) => {
  const { eventId, withCalendarModal } = route.params;

  const { top } = useSafeAreaInsets();

  const { currentUser } = useCurrentUserContext();
  const { event, guests, team, refresh, isRefreshing, owner, isLoading } = useEventDetailsQueries(eventId);
  const eventType = useMemo(() => {
    return getEventType(event?.teamId, event?.isIndividual);
  }, [event?.teamId, event?.isIndividual]);
  const isAllTeamsEvent = eventType === EventType.ALL_TEAMS;

  const { isRemoveLoading, removeEvent, isRemoveModalVisible, setIsRemoveModalVisible } = useRemoveEventQueries(
    eventId,
    navigation.goBack,
  );
  const { isCalendarModalVisible, setIsCalendarModalVisible } = useCalendarEvent(
    event?.startsAt,
    event?.endsAt,
    withCalendarModal,
  );
  const eventActions = useEventActions();
  const eventModals = useEventActionsModalsContext();

  const isPastEvent = event?.startsAt < Date.now();
  const isOngoingEvent = event?.startsAt < Date.now() && event?.endsAt > Date.now();
  const isTodayEvent = useMemo(() => (event?.startsAt ? getIsDateToday(event.startsAt) : false), [event?.startsAt]);
  const eventDate = useMemo(() => {
    if (!event?.startsAt) return null;
    const date = getMonthDayAndYear(event.startsAt);

    return isTodayEvent ? addTodayToDateString(date) : date;
  }, [isTodayEvent, event?.startsAt]);
  const isCurrentUserOwner = useMemo(() => event?.ownerId === currentUser?.id, [currentUser?.id, event?.ownerId]);
  const currentUserGuest = useMemo(() => {
    return guests.find(guest => guest.user?.id === currentUser?.id) || null;
  }, [currentUser?.id, guests]);
  const isCurrentUserAttendee = !!currentUserGuest || isAllTeamsEvent;
  const isCurrentUserAttending = currentUserGuest?.isAttending as boolean | null;

  const handleUserPress = useCallback((userId?: string) => {
    if (!userId) return;

    navigation.navigate(Screens.USER_PROFILE, { userId });
  }, []);

  const handleEditPress = useCallback(() => {
    if (!isCurrentUserOwner) return;

    navigation.navigate(Screens.EDIT_EVENT, { eventId });
  }, [isCurrentUserOwner, eventId]);

  const handleRemovePress = useCallback(() => {
    if (!isCurrentUserOwner) return;

    setIsRemoveModalVisible(true);
  }, [isCurrentUserOwner]);

  const handleAddToCalendarPress = async () => {
    if (!event) return;

    await saveEventToAppCalendar(event);
    setIsCalendarModalVisible(false);
  };

  const handleAcceptPress = async () => {
    await eventActions.acceptInvitation();

    InteractionManager.runAfterInteractions(() => {
      setIsCalendarModalVisible(true);
    });
  };

  const handleJoinPress = async () => {
    await eventActions.joinEvent();

    InteractionManager.runAfterInteractions(() => {
      setIsCalendarModalVisible(true);
    });
  };

  const handleJoinAllTeamPress = async () => {
    await eventActions.joinAllTeamsEvent(eventId);

    InteractionManager.runAfterInteractions(() => {
      setIsCalendarModalVisible(true);
    });
  };

  const handleAttendingPress = () => {
    eventModals.setAttendingEventMeta({ eventId, isAllTeamsEvent });
  };

  const handleNotAttendingPress = () => {
    eventModals.setNotAttendingEventMeta({ eventId, isAllTeamsEvent });
  };

  const handleRespondPress = () => {
    eventModals.setRespondingEventMeta({ eventId, isAllTeamsEvent });
  };

  const stickyButton =
    isPastEvent || isCurrentUserOwner || !isCurrentUserAttendee || event?.isCancelled ? null : (
      <EventButton
        isContained
        isAllTeamsEvent={isAllTeamsEvent}
        isAttendingLoading={eventActions.isAttendingLoading}
        isNotAttendingLoading={eventActions.isNotAttendingLoading}
        isCurrentUserAttending={isCurrentUserAttending}
        onJoinAllTeamsPress={handleJoinAllTeamPress}
        onAttendingPress={handleAttendingPress}
        onNotAttendingPress={handleNotAttendingPress}
        onRespondPress={handleRespondPress}
      />
    );

  if (isLoading || !event) return <FullScreenLoader style={styles.container} />;

  return (
    <>
      <MainLayout
        containerStyle={styles.container}
        headerContainerStyle={headerBackButtonContainerStyles}
        stickyBottomContainerStyle={styles.stickyBottomContainer}
        style={{ paddingTop: top }}
        isHeaderBackgroundInvisible
        onRefresh={refresh}
        isRefreshing={isRefreshing}
        header={<HeaderBackButton />}
        stickyBottomContent={stickyButton}>
        <Image
          style={styles.image}
          placeholder={imagePlaceholderSrc}
          source={event.imageUrl ? null : imagePlaceholderSrc}
          url={event.imageUrl || undefined}
        />
        <EventTypeIcon style={[styles.icon, { top: top + styles.icon.top }]} eventType={eventType} isTextVisible />

        <View style={styles.bodyContainer}>
          <View style={styles.header}>
            <EntityInfo
              fullName={isAllTeamsEvent ? 'All Teams' : team?.name || ''}
              avatarSource={isAllTeamsEvent ? allTeamImgSrc : undefined}
              avatarUrl={team?.imageUrl || undefined}
              avatarSize={40}
              gap={12}
              avatarType="square"
              typographyVariant="h5"
              AvatarBadge={team ? getAvatarImageOrganizationBadge(team.organization) : undefined}
              badge={
                isOngoingEvent ? (
                  <Badge
                    style={styles.headerBadge}
                    text="Happening Now"
                    textTransform="none"
                    textVariant="body3Bold"
                    textColor={colors.white}
                    bgColor={team ? colors.primaryMain : colors.purpleGradientStart}
                  />
                ) : null
              }
            />
            <View style={styles.headerTextContent}>
              <Typography variant="h3">{event.title}</Typography>
              <TruncatedText variant="paragraph1" text={event.description} />
            </View>
          </View>

          <Divider />

          <View style={styles.featuresList}>
            <Feature
              Icon={Calendar}
              iconVariant="Linear"
              textColor={!isPastEvent && isTodayEvent ? colors.primaryMain : undefined}>
              {eventDate}
            </Feature>
            <Feature Icon={Clock} iconVariant="Linear">
              {getFullTextDateTime(event.startsAt)}
              &nbsp;
              <ArrowRight2 size={12} color={colors.grey500} variant="Bold" />
              &nbsp;
              {getFullTextDateTime(event.endsAt)}
            </Feature>
            <Feature Icon={isAllTeamsEvent ? Global : MenuBoard} iconVariant="Linear">
              {eventTypeValues[eventType]}
            </Feature>
            <Feature Icon={Location} iconVariant="Linear">
              {event.location?.locationName}
            </Feature>
          </View>

          {isCurrentUserAttending && !isPastEvent && !event?.isCancelled ? (
            <Button
              style={styles.buttonMarginTop}
              text="Add to Calendar"
              color="white"
              size="large"
              shape="rectangle"
              fullWidth
              onPress={handleAddToCalendarPress}
              startAdornment={<SystemCalendarIcon color={colors.primaryMain} variant="Bold" size={20} />}
            />
          ) : null}

          <Divider />

          <View style={styles.locationSection}>
            <Typography variant="h4">Location</Typography>
            <View>
              <Typography variant="h6">{event.location?.locationName}</Typography>
              <Typography style={styles.locationSectionAddress} variant="body1Medium">
                {event.address}
              </Typography>

              <Button
                style={styles.buttonMarginTop}
                text="Get Directions"
                color="white"
                size="large"
                shape="rectangle"
                disabled={!event.location}
                fullWidth
                startAdornment={
                  <Location color={event.location ? colors.primaryMain : colors.grey400} variant="Bold" size={20} />
                }
                onPress={() => {
                  handleDirectionsPress(event.location?.lat!, event.location?.lng!);
                }}
              />
            </View>
          </View>

          {guests.length ? (
            <>
              <Divider />
              <View style={styles.guestsSection}>
                {isAllTeamsEvent ? null : (
                  <>
                    <Typography variant="body1SemiBold">Event created by</Typography>
                    <EntityCard
                      style={styles.ownerCard}
                      name={`${owner?.firstName} ${owner?.lastName}`}
                      avatarUrl={owner?.avatarUrl ?? undefined}
                      isDisabledEntity={owner?.isDisabled}
                      isArrowVisible={!owner?.isDisabled}
                      onPress={() => handleUserPress(owner?.id)}
                    />

                    <Divider marginVertical={24} />
                  </>
                )}

                <EventGuests guests={guests} eventType={eventType} onGustPress={handleUserPress} />
              </View>
            </>
          ) : null}

          {isCurrentUserOwner && !isPastEvent && !event?.isCancelled ? (
            <>
              <Divider />

              <View style={styles.footerButtons}>
                <Button
                  text="Edit Event"
                  color="white"
                  size="large"
                  shape="rectangle"
                  fullWidth
                  startAdornment={<Edit color={colors.primaryMain} variant="Linear" size={20} />}
                  onPress={handleEditPress}
                />
                <Button
                  text="Delete Event"
                  color="whiteDanger"
                  size="large"
                  shape="rectangle"
                  fullWidth
                  startAdornment={<Trash color={colors.danger} variant="Linear" size={20} />}
                  onPress={handleRemovePress}
                />
              </View>
            </>
          ) : null}
        </View>
      </MainLayout>

      <DeleteEventConfirmation
        isVisible={isRemoveModalVisible}
        onClose={() => setIsRemoveModalVisible(false)}
        onDeletePress={removeEvent}
        isDisabled={isRemoveLoading}
      />

      <AddEventToCalendarModal
        isVisible={isCalendarModalVisible}
        onClose={() => setIsCalendarModalVisible(false)}
        onAddToCalendarPress={handleAddToCalendarPress}
        isAllTeamsEvent={isAllTeamsEvent}
      />

      <RespondToEventInvitationModal
        isVisible={!!eventModals.respondingEventMeta}
        onClose={() => eventModals.setRespondingEventMeta(null)}
        onAcceptPress={handleAcceptPress}
        onDeclinePress={eventActions.declineInvitation}
        isDisabled={eventActions.isRespondLoading}
      />

      {isCurrentUserAttending ? (
        <YouAreAttendingModal
          isVisible={!!eventModals.attendingEventMeta}
          onClose={() => eventModals.setAttendingEventMeta(null)}
          isAllTeamsEvent={isAllTeamsEvent}
          isDisabled={eventActions.isAttendingLoading}
          onLeavePress={eventActions.leaveEvent}
        />
      ) : (
        <YouAreNotAttendingModal
          isVisible={!!eventModals.notAttendingEventMeta}
          onClose={() => eventModals.setNotAttendingEventMeta(null)}
          isDisabled={eventActions.isNotAttendingLoading}
          onJoinPress={handleJoinPress}
        />
      )}
    </>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey100 },
  bodyContainer: {
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  image: {
    height: headerImageHeight,
    width: screenWidth,
    flex: 1,
    objectFit: 'cover',
  },
  icon: {
    position: 'absolute',
    top: 18,
    right: 18,
  },
  header: {
    gap: 18,
  },
  headerBadge: {
    height: 26,
    paddingVertical: 2,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: colors.white,
  },
  headerTextContent: {
    gap: 18,
  },
  featuresList: {
    gap: 14,
  },
  locationSection: {
    gap: 24,
  },
  buttonMarginTop: {
    marginTop: 32,
  },
  locationSectionAddress: {
    marginTop: 6,
    color: colors.grey500,
    maxWidth: 200,
  },
  guestsSection: {
    ...effects.shadow1,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.grey200,
    padding: 20,
  },
  ownerCard: {
    marginTop: 18,
    borderWidth: 0,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
    padding: 0,
    backgroundColor: 'transparent',
  },
  footerButtons: {
    gap: 8,
  },
  stickyBottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
