import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { HomeStackParamList, Screens, Stacks } from '~types/navigation';
import { colors } from '~Theme/Colors';
import { MainLayout } from '~Components/MainLayout';
import { LargeTitleHeader } from '~Components/ScreenHeader/LargeTitleHeader';
import { Divider } from '~Components/Divider';
import { Typography } from '~Components/Typography';
import { ShortcutButton } from '~Components/ShortcutButton';
import { ArrowRight2, MenuBoard, MessageText } from 'iconsax-react-native';
import { useHomeQueries } from '~Containers/Home/hooks/useHomeQueries';
import { FullScreenLoader } from '~Components/Loader/FullScreenLoader';
import { AvatarImage } from '~Components/Avatar/AvatarImage';
import { getInitials, getMergedText } from '~utils/textFormat';
import { Button } from '~Components/Button';
import { EntityInfo } from '~Components/EntityInfo';
import { useChatContext } from '~Context/ChatContext';
import { EventCardLarge } from '~Components/EventCard/EventCardLarge';
import { getEventType } from '~utils/eventType';
import { RespondToEventInvitationModal } from '~Components/Events/RespondToEventInitationModal';
import { YouAreAttendingModal } from '~Components/Events/YouAreAttendingEventModal';
import { YouAreNotAttendingModal } from '~Components/Events/YouAreNotAttendingEventModal';
import { useEventActions } from '~Hooks/useEventActions';
import { useEventActionsModalsContext } from '~Hooks/useEventActionsModalsContext';
import { CommonActions } from '@react-navigation/native';
import { EventCardSmall } from '~Components/EventCard/EventCardSmall';
import { getAvatarImageOrganizationBadge } from '~Components/Avatar/avatarImageOrganizationBadge';
import { getAvatarImageProfileBadge } from '~Components/Avatar/avatarImageProfileBadge';
import { getColorFromString } from '~utils/color';
import { EmptyPlaceholder } from '~Components/EmptyPlaceholder';

type HomeProps = BottomTabScreenProps<HomeStackParamList, Screens.HOME>;

export function Home({ navigation }: HomeProps) {
  const { currentUser } = useCurrentUserContext();

  const { isLoading, isLoaded, members, teams, events, invitations, isRefreshing, refresh } = useHomeQueries(
    !currentUser,
  );

  const userFullName = `${currentUser?.firstName} ${currentUser?.lastName}`;

  const { unreadCount } = useChatContext();
  const eventModals = useEventActionsModalsContext();
  const eventActions = useEventActions();

  const handleOwmProfilePress = () => {
    navigation.dispatch(CommonActions.navigate(Stacks.TABS, { screen: Stacks.PROFILE }));
  };

  const handleEventsPress = () => {
    navigation.dispatch(CommonActions.navigate(Stacks.TABS, { screen: Stacks.EVENTS }));
  };

  const handleTeamsAndMembersPress = () => {
    if (!teams.length) return;

    navigation.navigate(Screens.TEAMS);
  };

  const handleMessagesPress = () => {
    navigation.dispatch(CommonActions.navigate(Stacks.TABS, { screen: Stacks.MESSENGER }));
  };

  const handleEventInvitesPress = () => {
    const state = navigation.getParent()?.getState();
    if (!state) return;

    const routes = [
      ...state.routes.filter(({ name }) => name !== Stacks.EVENTS),
      {
        name: Stacks.EVENTS,
        state: {
          index: 1,
          routes: [{ name: Screens.EVENTS }, { name: Screens.EVENT_INVITATIONS }],
        },
      },
    ];

    navigation.dispatch(CommonActions.reset({ ...state, index: routes.length - 1, routes }));
  };

  const handleMemberPress = (userId: string) => {
    navigation.navigate(Screens.USER_PROFILE, { userId });
  };

  const handleTeamPress = (teamId: string) => {
    navigation.navigate(Screens.TEAM_DETAILS, { teamId });
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate(Screens.EVENT_DETAILS, { eventId });
  };

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

  if (isLoading && !isLoaded) return <FullScreenLoader style={styles.container} />;

  return (
    <>
      <MainLayout containerStyle={styles.container} isRefreshing={isRefreshing} onRefresh={refresh}>
        <LargeTitleHeader style={styles.bodyWrapper} title="Home" />
        <View style={styles.bodyWrapper}>
          <TouchableOpacity style={styles.bodyUserInfo} activeOpacity={0.6} onPress={handleOwmProfilePress}>
            <EntityInfo
              fullName={userFullName}
              avatarUrl={currentUser?.avatarUrl ?? undefined}
              avatarSize={36}
              typographyVariant="h5">
              <Typography style={styles.bodyUserInfoBottomText} variant="body3Medium">
                View your Profile
              </Typography>
            </EntityInfo>
          </TouchableOpacity>

          <Divider />

          <View>
            <Typography style={styles.bodySectionName} variant="h4">
              Shortcuts
            </Typography>

            <View style={styles.bodyShortcuts}>
              <View style={styles.bodyShortcutsTop}>
                <ShortcutButton Icon={MenuBoard} text="Events" onPress={handleEventsPress} />
                <ShortcutButton
                  Icon={MessageText}
                  text="Messages"
                  isBadgeVisible={!!unreadCount}
                  badgeColor={colors.dangerMain}
                  onPress={handleMessagesPress}
                />
              </View>
              {invitations.length > 0 && (
                <ShortcutButton
                  Icon={MenuBoard}
                  text="Event Invitations"
                  counter={invitations.length}
                  gradient="blue"
                  isHorizontal
                  onPress={handleEventInvitesPress}
                />
              )}
            </View>
          </View>

          <Divider />
        </View>

        <View style={styles.bodyTeams}>
          <TouchableOpacity
            style={[styles.bodyEventsHeader, styles.bodyWrapper]}
            disabled={!teams.length}
            activeOpacity={0.6}
            onPress={handleTeamsAndMembersPress}>
            <View style={styles.bodyEventsHeaderTop}>
              <Typography variant="h4">Teams & Members</Typography>
              <ArrowRight2 size={18} color={colors.grey400} />
            </View>
          </TouchableOpacity>

          {members.length ? (
            <ScrollView style={styles.bodyTeamMembers} horizontal showsHorizontalScrollIndicator={false}>
              <View style={[styles.bodyTeamMembersList, styles.bodyWrapper]}>
                {teams.map(({ name, organization, imageUrl, id }) => (
                  <TouchableOpacity
                    style={styles.bodyTeamMembersItem}
                    activeOpacity={0.8}
                    key={id}
                    onPress={() => handleTeamPress(id)}>
                    <AvatarImage
                      url={imageUrl}
                      type="square"
                      initials={getInitials(name)}
                      size={60}
                      Badge={getAvatarImageOrganizationBadge(organization)}
                    />
                    <Typography style={styles.textGrey} align="center" numberOfLines={2} variant="body3SemiBold">
                      {name}
                    </Typography>
                  </TouchableOpacity>
                ))}

                {members.map(({ user, organization }) => {
                  if (!user) return null;
                  const fullName = `${user.firstName} ${user.lastName}`;

                  return (
                    <TouchableOpacity
                      style={styles.bodyTeamMembersItem}
                      activeOpacity={0.8}
                      key={user.id}
                      onPress={() => handleMemberPress(user.id)}>
                      <AvatarImage
                        url={user.avatarUrl}
                        initials={getInitials(fullName)}
                        size={60}
                        Badge={getAvatarImageProfileBadge(getColorFromString(organization.id))}
                      />
                      <Typography style={styles.textGrey} align="center" numberOfLines={2} variant="body3SemiBold">
                        {fullName}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.bodyWrapper}>
              <EmptyPlaceholder title="No teams & Members" height={70} />
            </View>
          )}
        </View>

        <View style={styles.bodyWrapper}>
          <Divider />

          <View style={styles.bodyEvents}>
            <TouchableOpacity style={styles.bodyEventsHeader} activeOpacity={0.6} onPress={handleEventsPress}>
              <View style={styles.bodyEventsHeaderTop}>
                <Typography variant="h4">Events</Typography>
                <ArrowRight2 size={18} color={colors.grey400} />
              </View>
              <Typography style={styles.textGrey} variant="body1Medium">
                Showing your upcoming events
              </Typography>
            </TouchableOpacity>

            {events.length > 0 && (
              <>
                {events.map((item: any, index) => {
                  const isOngoing = item.startsAt < Date.now() && item.endsAt > Date.now();

                  return isOngoing ? (
                    <EventCardSmall
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      startsAt={item.startsAt}
                      endsAt={item.endsAt}
                      imageUrl={item.imageUrl}
                      team={item.team}
                      onPress={handleEventPress}
                    />
                  ) : (
                    <EventCardLarge
                      key={item.id + index}
                      id={item.id}
                      eventType={getEventType(item.teamId, item.isIndividual)}
                      header={item.title}
                      teamInfo={item.teamId && item.team ? item.team : undefined}
                      date={item.startsAt}
                      location={getMergedText([item.location.locationName, item.address])}
                      attendees={item.guests}
                      ownerId={item.ownerId}
                      imageUrl={item.imageUrl ?? undefined}
                      onPress={handleEventPress}
                    />
                  );
                })}
              </>
            )}
            {events.length === 0 && <EmptyPlaceholder title="You don’t have upcoming events." height={200} />}

            <Button
              text="All Events"
              color="white"
              shape="rectangle"
              size="large"
              activeOpacity={0.8}
              fullWidth
              onPress={handleEventsPress}
            />
          </View>
        </View>
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
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey100 },
  bodyWrapper: {
    paddingHorizontal: 24,
  },

  bodyUserInfo: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 12,
  },
  bodyUserInfoBottomText: {
    color: colors.grey400,
  },
  bodySectionName: {
    color: colors.black,
  },
  bodyShortcuts: {
    marginTop: 18,
    gap: 8,
  },
  bodyShortcutsTop: {
    gap: 8,
    flexDirection: 'row',
  },
  bodyTeams: {
    gap: 24,
  },
  bodyTeamMembers: {
    height: 98,
    minHeight: 98,
  },
  bodyTeamMembersList: {
    gap: 8,
    flexDirection: 'row',
  },
  bodyTeamMembersItem: {
    width: 80,
    maxWidth: 80,
    alignItems: 'center',
    gap: 10,
  },
  textGrey: {
    color: colors.grey500,
    flex: 1,
    letterSpacing: -0.2,
  },
  bodyEvents: {
    gap: 24,
  },
  bodyEventsHeader: {
    gap: 4,
  },
  bodyEventsHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
