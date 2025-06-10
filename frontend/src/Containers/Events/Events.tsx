import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  FlatList,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { AddCircle, MenuBoard, ArrowRight2 } from 'iconsax-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventUser } from '@up-from/graphql/genql';
import { EventsStackParamList, Screens } from '~types/navigation';
import { EventsFilter } from '~types/event';
import { LargeTitleHeader } from '~Components/ScreenHeader/LargeTitleHeader';
import { colors } from '~Theme/Colors';
import { useEventsQueries } from './hooks/useEventsQueries';
import { EventCardLarge } from '~Components/EventCard/EventCardLarge';
import { getEventType } from '~utils/eventType';
import { Typography } from '~Components/Typography';
import { FullScreenLoader } from '~Components/Loader/FullScreenLoader';
import { ShortcutButton } from '~Components/ShortcutButton';
import { Selector } from '~Components/Selector';
import { Divider } from '~Components/Divider';
import { Button } from '~Components/Button';
import { useTeamEventsQueries } from './hooks/useTeamEventsQueries';
import { useAllTeamsEventsQueries } from './hooks/useAllTeamsEventsQueries';
import { useMyEventsQueries } from './hooks/useMyEventsQueries';
import { RespondToEventInvitationModal } from '~Components/Events/RespondToEventInitationModal';
import { YouAreAttendingModal } from '~Components/Events/YouAreAttendingEventModal';
import { YouAreNotAttendingModal } from '~Components/Events/YouAreNotAttendingEventModal';
import { useEventActionsModalsContext } from '~Hooks/useEventActionsModalsContext';
import { useEventActions } from '~Hooks/useEventActions';
import { getMergedText } from '~utils/textFormat';
import { FlatListFooterLoader } from '~Components/Loader/FlatListFooterLoader';
import { SearchTextField } from '~Components/Field/SearchTextField';
import { EmptyPlaceholder } from '~Components/EmptyPlaceholder';
import { DateRangePicker } from '~Components/DateRangePicker';
import { getIsDateToday } from '~utils/dateFormat';
import { EventCardSmall } from '~Components/EventCard/EventCardSmall';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';

type EventsProps = BottomTabScreenProps<EventsStackParamList, Screens.EVENTS>;

const deviceWidth = Dimensions.get('window').width;
const filterOptions = {
  [EventsFilter.YOURS]: deviceWidth > 360 ? 'Your Events' : 'You',
  [EventsFilter.TEAM]: deviceWidth > 360 ? 'Team Events' : 'Team',
  [EventsFilter.ALL_TEAMS]: deviceWidth > 360 ? 'All Teams Events' : 'All Teams',
};
const filterHeadlineOptions = {
  [filterOptions[EventsFilter.YOURS]]: 'Your Events',
  [filterOptions[EventsFilter.TEAM]]: 'Team Events',
  [filterOptions[EventsFilter.ALL_TEAMS]]: 'All Teams Events',
};
const selectorOptions = Object.values(filterOptions);
enum timeRange {
  UPCOMING = 'Upcoming',
  TODAY = 'Today',
  TOMORROW = 'Tomorrow',
}

const getTime = (option: timeRange) => {
  switch (option) {
    case timeRange.UPCOMING:
      return [Date.now(), undefined];

    case timeRange.TODAY: {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      return [Date.now(), endOfDay.getTime()];
    }

    case timeRange.TOMORROW: {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const tomorrowEndOfDay = new Date();
      tomorrowEndOfDay.setDate(tomorrowEndOfDay.getDate() + 2);
      tomorrowEndOfDay.setHours(23, 59, 59, 999);

      return [tomorrow.getTime(), tomorrowEndOfDay.getTime()];
    }

    default:
      return [undefined, undefined];
  }
};

export const Events: FC<EventsProps> = ({ navigation, route }) => {
  const eventsFilter = route.params?.eventsFilter;
  const { top } = useSafeAreaInsets();

  const { currentUser } = useCurrentUserContext();
  const [fromDate, setFrom] = useState<string | number | Date | undefined>(Date.now());
  const [toDate, setTo] = useState<string | number | Date | undefined>(undefined);
  const [selectedOption, setSelectedOption] = useState<string>(filterOptions[eventsFilter || EventsFilter.YOURS]);
  const [timeOption, setTimeOption] = useState(timeRange.UPCOMING);
  const [isCustomVisible, setIsCustomVisible] = useState(false);

  const minimumDate = useMemo(() => new Date(), []);

  const isCreateDisabled = !currentUser?.teams?.length;

  const isTodayDateSelected = useMemo(() => {
    if (timeOption === timeRange.TODAY) return true;

    return !!fromDate && getIsDateToday(fromDate);
  }, [timeOption, fromDate]);

  const { myEvents, isLoadingMyEvents, ...myEventsPagination } = useMyEventsQueries(
    selectedOption !== filterOptions[EventsFilter.YOURS],
    fromDate,
    toDate,
    false,
    isTodayDateSelected,
  );
  const { teamEvents, isLoadingTeamEvents, ...teamEventsPagination } = useTeamEventsQueries(
    selectedOption !== filterOptions[EventsFilter.TEAM],
    fromDate,
    toDate,
    false,
    isTodayDateSelected,
  );
  const { allTeamsEvents, isLoadingAllTeamEvents, ...allTeamsEventsPagination } = useAllTeamsEventsQueries(
    selectedOption !== filterOptions[EventsFilter.ALL_TEAMS],
    fromDate,
    toDate,
    false,
    isTodayDateSelected,
  );
  const { isLoading, invitations, ...invitationsPagination } = useEventsQueries();

  const isEventsLoading = isLoadingAllTeamEvents || isLoadingMyEvents || isLoadingTeamEvents;
  const isEventsLoadingMore =
    myEventsPagination.isLoadingMore || teamEventsPagination.isLoadingMore || allTeamsEventsPagination.isLoadingMore;
  const isRefreshing =
    myEventsPagination.isRefreshing ||
    teamEventsPagination.isRefreshing ||
    allTeamsEventsPagination.isRefreshing ||
    invitationsPagination.isRefreshing;

  const eventModals = useEventActionsModalsContext();
  const eventActions = useEventActions();

  useEffect(() => {
    const [fromTime, toTime] = getTime(timeOption);
    setFrom(fromTime);
    setTo(toTime);
  }, [timeOption]);

  const endAdornment = isCreateDisabled ? null : (
    <TouchableOpacity onPress={() => navigation.navigate(Screens.CREATE_EVENT)} activeOpacity={0.6}>
      <AddCircle size={24} color={colors.primaryMain} />
    </TouchableOpacity>
  );

  const buttonsColor = selectedOption === filterOptions[EventsFilter.ALL_TEAMS] ? 'purpleGradient' : 'blueGradient';
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

  const handleSelectToday = () => {
    setTimeOption(timeRange.TODAY);
  };

  const handleSelectTomorrow = () => {
    setTimeOption(timeRange.TOMORROW);
  };
  const handleSelectUpcoming = () => {
    setTimeOption(timeRange.UPCOMING);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    if (timeOption !== timeRange.UPCOMING) setTimeOption(timeRange.UPCOMING);
  };

  const handlePastEventsPress = () => {
    const keys = Object.keys(filterOptions);

    navigation.navigate(Screens.PAST_EVENTS, {
      eventsFilter: keys[selectorOptions.indexOf(selectedOption)] as EventsFilter,
    });
  };

  const handleSearchPress = () => {
    navigation.navigate(Screens.EVENTS_SEARCH);
  };

  const handleCustomClearPress = () => {
    setIsCustomVisible(false);
    const [fromTime, toTime] = getTime(timeOption);
    setFrom(fromTime);
    setTo(toTime);
  };

  const handleCustomPress = () => {
    setIsCustomVisible(true);
  };

  const handleCustomDateRangeChange = (start: number, end: number) => {
    setFrom(start);
    setTo(end);
  };

  const events = useMemo(() => {
    switch (selectedOption) {
      case filterOptions[EventsFilter.TEAM]:
        return teamEvents;
      case filterOptions[EventsFilter.ALL_TEAMS]:
        return allTeamsEvents;
      case filterOptions[EventsFilter.YOURS]:
        return myEvents;

      default:
        return [];
    }
  }, [teamEvents, allTeamsEvents, myEvents, selectedOption]);

  const handleLoadMore = () => {
    switch (selectedOption) {
      case filterOptions[EventsFilter.TEAM]:
        if (!teamEventsPagination?.hasNextPage) return;

        teamEventsPagination?.loadMore();
        return;
      case filterOptions[EventsFilter.ALL_TEAMS]:
        if (!allTeamsEventsPagination.hasNextPage) return;

        allTeamsEventsPagination?.loadMore();
        return;
      case filterOptions[EventsFilter.YOURS]:
        if (!myEventsPagination?.hasNextPage) return;

        myEventsPagination?.loadMore();
        return;

      default:
        return;
    }
  };

  const handleRefresh = () => {
    const [startTime, endTime] = getTime(timeOption);
    setFrom(startTime);
    setTo(endTime);

    teamEventsPagination.refresh();
    allTeamsEventsPagination.refresh();
    myEventsPagination.refresh();
    invitationsPagination.refresh();
  };

  if (isLoading) return <FullScreenLoader style={styles.container} />;

  return (
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={[styles.bodyContainer, { paddingTop: top }]}
        data={isEventsLoading ? [] : events}
        keyExtractor={item => item.id}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            progressViewOffset={top}
            refreshing={isRefreshing}
            tintColor={colors.grey500}
            colors={[colors.grey500, colors.grey500, colors.grey500, colors.grey500]}
            onRefresh={handleRefresh}
          />
        }
        onEndReached={handleLoadMore}
        renderItem={({ item }) => {
          const isOngoing = item.startsAt < Date.now() && item.endsAt > Date.now();

          return (
            <View style={[styles.wrapper, styles.event]}>
              {isOngoing ? (
                <EventCardSmall
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
                  eventType={getEventType(item.teamId, item.isIndividual)}
                  header={item.title}
                  teamInfo={item.teamId && item.team ? item.team : undefined}
                  date={item.startsAt}
                  location={getMergedText([item.location!.locationName, item.address!])}
                  attendees={item.guests as Required<EventUser>[]}
                  imageUrl={item.imageUrl ?? undefined}
                  id={item.id}
                  onPress={handleEventPress}
                  ownerId={item.ownerId}
                />
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          isEventsLoading ? (
            <FullScreenLoader style={styles.container} />
          ) : (
            <View style={[styles.wrapper, styles.event]}>
              <EmptyPlaceholder title="You don’t have events." />
            </View>
          )
        }
        ListHeaderComponent={
          <>
            <View style={styles.wrapper}>
              <LargeTitleHeader title="Events" endAdornment={endAdornment} style={styles.header} />
              <SearchTextField
                style={[styles.search]}
                placeholder="Search"
                editable={false}
                onContainerPress={handleSearchPress}
              />
            </View>
            {invitations.length > 0 && (
              <>
                <View style={styles.wrapper}>
                  <TouchableOpacity
                    style={styles.invitationsHeader}
                    onPress={() => navigation.navigate(Screens.EVENT_INVITATIONS)}
                    activeOpacity={0.6}>
                    <Typography variant="h4" style={styles.invitationsHeaderText}>
                      Invitations
                    </Typography>
                    <ArrowRight2 color={colors.grey400} size={18} style={styles.icon} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.invitationsContainer}
                  contentContainerStyle={[styles.invitationsContainerContent, styles.wrapper]}
                  showsHorizontalScrollIndicator={false}
                  horizontal={true}>
                  {invitations.map(item => {
                    return (
                      <ShortcutButton
                        key={item.id}
                        text={item.title}
                        gradient="blue"
                        isBadgeVisible={true}
                        Icon={MenuBoard}
                        style={styles.invitation}
                        onPress={() => handleEventPress(item.id)}
                      />
                    );
                  })}
                </ScrollView>

                <View style={styles.wrapper}>
                  <Divider />
                </View>
              </>
            )}

            <View style={styles.wrapper}>
              <Selector
                options={selectorOptions}
                selectedOption={selectedOption}
                onOptionSelected={handleOptionSelect}
              />
              <Typography variant="h4" style={styles.eventsHeaderText}>
                {filterHeadlineOptions[selectedOption]}
              </Typography>
            </View>

            <ScrollView
              style={styles.timeOptionsContainer}
              contentContainerStyle={[styles.timeOptions, styles.wrapper]}
              showsHorizontalScrollIndicator={false}
              horizontal>
              {isCustomVisible ? (
                <DateRangePicker
                  size="medium"
                  label="Custom Timeline"
                  withoutOpenButton
                  minimumDate={minimumDate}
                  isDisabled={isEventsLoading}
                  onChange={handleCustomDateRangeChange}
                  onClearPress={handleCustomClearPress}
                />
              ) : (
                <>
                  <Button
                    style={timeOption === timeRange.UPCOMING ? styles.filterTimeTab : undefined}
                    shape="pill"
                    size="medium"
                    text={timeRange.UPCOMING}
                    color={timeOption === timeRange.UPCOMING ? buttonsColor : 'white'}
                    onPress={handleSelectUpcoming}
                  />
                  <Button
                    style={timeOption === timeRange.TODAY ? styles.filterTimeTab : undefined}
                    shape="pill"
                    size="medium"
                    text={timeRange.TODAY}
                    color={timeOption === timeRange.TODAY ? buttonsColor : 'white'}
                    onPress={handleSelectToday}
                  />
                  <Button
                    style={timeOption === timeRange.TOMORROW ? styles.filterTimeTab : undefined}
                    shape="pill"
                    size="medium"
                    text={timeRange.TOMORROW}
                    color={timeOption === timeRange.TOMORROW ? buttonsColor : 'white'}
                    onPress={handleSelectTomorrow}
                  />
                  <Button shape="pill" text="Custom" size="medium" color="grey" onPress={handleCustomPress} />
                </>
              )}
            </ScrollView>
          </>
        }
        ListFooterComponent={
          <>
            <FlatListFooterLoader isLoading={isEventsLoadingMore} />

            {isEventsLoading ? null : (
              <View style={styles.wrapper}>
                <Divider marginVertical={8} />
                <Button
                  style={styles.pastEventsButton}
                  text="Past Events"
                  color="grey"
                  shape="rectangle"
                  size="large"
                  fullWidth
                  onPress={handlePastEventsPress}
                />
              </View>
            )}
          </>
        }
      />

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

const isIOS = Platform.OS === 'ios';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey100 },
  bodyContainer: { paddingBottom: 200 },
  event: {
    marginBottom: 24,
  },
  wrapper: { paddingHorizontal: 24 },
  search: {
    marginBottom: 24,
  },
  header: { flex: 1, marginBottom: 18 },
  eventsHeaderText: {
    marginTop: 24,
    color: colors.black,
  },
  invitationsHeaderText: { color: colors.black },
  invitationsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    minHeight: 74,
    height: 74,
  },
  invitationsContainerContent: {
    height: 74,
    minHeight: 74,
  },
  invitation: {
    flex: 1,
    minWidth: 200,
    marginRight: 8,
  },
  invitationsHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
  },
  icon: { flex: 1, alignSelf: 'center' },
  timeOptionsContainer: {
    height: isIOS ? 86 : 87, // 44 + 18 + 24 (android needs an extra 1px)
    minHeight: isIOS ? 86 : 87, // 44 + 18 + 24 (android needs an extra 1px)
    paddingTop: 18,
    paddingBottom: 24,
  },
  timeOptions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 6,
  },
  pastEventsButton: {
    marginTop: 24,
  },
  filterTimeTab: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
});
