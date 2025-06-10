import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Clock, Location } from 'iconsax-react-native';
import { EventUser } from '@up-from/graphql/genql';
import { Image } from '~Components/Image/Image';
import { EntityInfo } from '~Components/EntityInfo';
import { Typography } from '~Components/Typography';
import { colors } from '~Theme/Colors';
import { Badge } from '~Components/Badge';
import { Feature } from '~Components/Feature';
import { Participants } from '~Components/Participants';
import { addTodayToDateString, getFullTextDateAndTime, getIsDateToday } from '~utils/dateFormat';
import { EventType } from '~types/event';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { EventTypeIcon } from '~Components/Events/EventTypeIcon';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { useEventActions } from '~Hooks/useEventActions';
import { EventButton } from '~Components/Events/EventButton';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Screens } from '~types/navigation';
import { useEventActionsModalsContext } from '~Hooks/useEventActionsModalsContext';

type EventCardProps = {
  imageUrl?: string;
  eventType: EventType;
  teamInfo?: any;
  header: string;
  id: string;
  date: number;
  location: string;
  attendees: Required<EventUser>[];
  ownerId: string;
  onPress: (id: string) => void;
};

const values = {
  [EventType.INDIVIDUAL]: 'Individual Event',
  [EventType.MY_TEAM]: 'Team Event',
  [EventType.ALL_TEAMS]: 'All Teams Event',
};

const iconSrc = require('~assets/images/infinity.png');
const placeholder = require('~assets/images/placeholderImage.png');

export function EventCardLarge({
  id,
  imageUrl,
  eventType,
  teamInfo,
  header,
  date,
  location,
  attendees,
  onPress,
  ownerId,
}: EventCardProps) {
  const { dispatch } = useNavigation();

  const isAllTeamsEvent = eventType === EventType.ALL_TEAMS;

  const acceptedAttendees = attendees.filter(({ isAttending }) => isAttending);
  const attendeesCount = acceptedAttendees.length;
  const participantsText = useMemo(() => {
    if (acceptedAttendees.length === 1) {
      const user = acceptedAttendees[0]?.user;
      if (!user) return 'Unknown User';
      return user.isDisabled ? 'Disabled User' : `${user.firstName} ${user.lastName}`;
    }

    return attendeesCount.toString() + ' Attendees';
  }, []);
  const formattedAttendees = acceptedAttendees
    .filter(item => item.user)
    .map(item => ({
      user: {
        id: item.user!.id,
        image: item.user!.avatarUrl,
        name: item.user!.firstName + ' ' + item.user!.lastName,
        isDisabled: item.user!.isDisabled,
      },
    }));
  const { currentUser } = useCurrentUserContext();
  const isCurrentUserOwner = ownerId === currentUser?.id;
  const currentUserAttendee = useMemo(() => {
    return attendees.find(attendee => attendee.user && attendee.user.id === currentUser?.id) || null;
  }, [currentUser?.id, attendees]);
  const isCurrentUserGuest = !!currentUserAttendee || isAllTeamsEvent;
  const isCurrentUserAttending = currentUserAttendee?.isAttending as boolean | null;
  const eventActions = useEventActions();
  const eventModals = useEventActionsModalsContext();
  const isPastEvent = date < Date.now();
  const isTodayEvent = getIsDateToday(date);
  const dateString = getFullTextDateAndTime(date);
  const dateValue = isTodayEvent ? addTodayToDateString(dateString) : dateString;

  const handleJoinAllTeamsPress = async () => {
    await eventActions.joinAllTeamsEvent(id);
    dispatch(CommonActions.navigate(Screens.EVENT_DETAILS, { eventId: id, withCalendarModal: true }));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.6} onPress={() => onPress(id)}>
        <Image
          style={styles.image}
          placeholder={placeholder}
          url={imageUrl ?? undefined}
          source={imageUrl ? undefined : placeholder}
          resizeMode="cover"
        />
        <EventTypeIcon style={styles.icon} eventType={eventType} />

        <View style={styles.info}>
          <View style={styles.eventTypeInfo}>
            <EntityInfo
              fullName={teamInfo?.name ? teamInfo?.name : eventType}
              avatarUrl={teamInfo?.imageUrl ?? undefined}
              avatarSource={teamInfo ? undefined : iconSrc}
              avatarSize={22}
              avatarType="square"
              typographyVariant="body2SemiBold"
            />
            <Badge
              text={values[eventType]}
              bgColor={colors.grey200}
              textColor={colors.grey600}
              textTransform="none"
              textVariant="label1SemiBold"
            />
          </View>
          <View style={styles.divider} />
          <Typography variant="h6" style={styles.header}>
            {header}
          </Typography>
          <Feature
            Icon={Clock}
            iconVariant="Bold"
            color={!isPastEvent && isTodayEvent ? colors.primaryMain : colors.grey500}
            textColor={!isPastEvent && isTodayEvent ? colors.primaryMain : colors.grey500}
            size={12}
            style={styles.feature}>
            {dateValue}
          </Feature>
          <Feature Icon={Location} iconVariant="Bold" color={colors.grey500} size={12} style={styles.feature}>
            {location}
          </Feature>
          <Participants
            participants={formattedAttendees}
            avatarSize={22}
            typographyVariant="body3Medium"
            text={participantsText}
            textColor={colors.grey400}
          />
        </View>
      </TouchableOpacity>

      {(isAllTeamsEvent || (!isCurrentUserOwner && isCurrentUserGuest)) && !isPastEvent ? (
        <View style={styles.eventButtonContainer}>
          <EventButton
            style={styles.eventButton}
            isAllTeamsEvent={isAllTeamsEvent}
            isAttendingLoading={eventActions.isAttendingLoading}
            isNotAttendingLoading={eventActions.isNotAttendingLoading}
            isCurrentUserAttending={isCurrentUserAttending}
            onJoinAllTeamsPress={handleJoinAllTeamsPress}
            onAttendingPress={() => eventModals.setAttendingEventMeta({ eventId: id, isAllTeamsEvent })}
            onNotAttendingPress={() => eventModals.setNotAttendingEventMeta({ eventId: id, isAllTeamsEvent })}
            onRespondPress={() => eventModals.setRespondingEventMeta({ eventId: id, isAllTeamsEvent })}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  eventTypeInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 8,
  },
  feature: {
    marginBottom: 8,
  },
  container: { flex: 1, borderRadius: 8, backgroundColor: colors.white },
  image: {
    flex: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: '100%',
    height: 200,
    overflow: 'hidden',
    alignItems: 'center',
  },
  info: { flex: 1, padding: 14, paddingTop: 10 },
  divider: { height: 1, marginTop: 15, marginBottom: 15, backgroundColor: colors.grey100, marginHorizontal: -15 },
  icon: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  eventButtonContainer: {
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  eventButton: {
    paddingVertical: 14,
  },
});
