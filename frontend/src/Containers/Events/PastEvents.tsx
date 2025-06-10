import React, { FC, useMemo, useState } from 'react';
import { StyleSheet, View, Dimensions, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { EventsStackParamList, Screens } from '~types/navigation';
import { EventsFilter } from '~types/event';
import { colors } from '~Theme/Colors';
import { EventCardLarge } from '~Components/EventCard/EventCardLarge';
import { getEventType } from '~utils/eventType';
import { Typography } from '~Components/Typography';
import { Selector } from '~Components/Selector';
import { Divider } from '~Components/Divider';
import { useTeamEventsQueries } from './hooks/useTeamEventsQueries';
import { useAllTeamsEventsQueries } from './hooks/useAllTeamsEventsQueries';
import { useMyEventsQueries } from './hooks/useMyEventsQueries';
import { getMergedText } from '~utils/textFormat';
import { Header } from '~Components/ScreenHeader/Header';
import { DateRangePicker } from '~Components/DateRangePicker';
import { FullScreenLoader } from '~Components/Loader/FullScreenLoader';
import { FlatListFooterLoader } from '~Components/Loader/FlatListFooterLoader';
import { EmptyPlaceholder } from '~Components/EmptyPlaceholder';

type Props = BottomTabScreenProps<EventsStackParamList, Screens.PAST_EVENTS>;

const deviceWidth = Dimensions.get('window').width;
const filterOptions = {
  [EventsFilter.YOURS]: deviceWidth > 360 ? 'Your Events' : 'You',
  [EventsFilter.TEAM]: deviceWidth > 360 ? 'Team Events' : 'Team',
  [EventsFilter.ALL_TEAMS]: deviceWidth > 360 ? 'All Teams Events' : 'All Teams',
};
const selectorOptions = Object.values(filterOptions);

export const PastEvents: FC<Props> = ({ navigation, route }) => {
  const eventsFilter = route.params?.eventsFilter;

  const { top } = useSafeAreaInsets();

  const [fromDate, setFrom] = useState<number>(0);
  const [toDate, setTo] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>(filterOptions[eventsFilter || EventsFilter.YOURS]);

  const dateNow = useMemo(() => Date.now(), []);

  const { myEvents, isLoadingMyEvents, ...myEventsPagination } = useMyEventsQueries(
    selectedOption !== filterOptions[EventsFilter.YOURS],
    fromDate,
    toDate || dateNow,
    true,
  );
  const { teamEvents, isLoadingTeamEvents, ...teamEventsPagination } = useTeamEventsQueries(
    selectedOption !== filterOptions[EventsFilter.TEAM],
    fromDate,
    toDate || dateNow,
    true,
  );
  const { allTeamsEvents, isLoadingAllTeamEvents, ...allTeamsEventsPagination } = useAllTeamsEventsQueries(
    selectedOption !== filterOptions[EventsFilter.ALL_TEAMS],
    fromDate,
    toDate || dateNow,
    true,
  );

  const isLoading = isLoadingMyEvents || isLoadingTeamEvents || isLoadingAllTeamEvents;
  const isEventsLoadingMore =
    myEventsPagination.isLoadingMore || teamEventsPagination.isLoadingMore || allTeamsEventsPagination.isLoadingMore;
  const isRefreshing =
    myEventsPagination.isRefreshing || teamEventsPagination.isRefreshing || allTeamsEventsPagination.isRefreshing;

  const handleEventPress = (eventId: string) => navigation.navigate(Screens.EVENT_DETAILS, { eventId });

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setFrom(0);
    setTo(0);
  };

  const handleRangeChange = (start: number, end: number) => {
    setFrom(start);
    setTo(end);
  };

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

  const events = useMemo((): any[] => {
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
  }, [selectedOption, myEvents, teamEvents, allTeamsEvents]);

  const handleRefresh = async () => {
    await Promise.all([
      teamEventsPagination.refresh(),
      allTeamsEventsPagination.refresh(),
      myEventsPagination.refresh(),
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.bodyContainer}
        scrollIndicatorInsets={{ top: 54 + styles.header.marginTop }}
        style={{ paddingTop: 54 + top + styles.header.marginTop }}
        ListEmptyComponent={
          isLoading ? (
            <FullScreenLoader style={styles.container} />
          ) : (
            <EmptyPlaceholder title="You don’t have past events." />
          )
        }
        refreshControl={
          <RefreshControl
            progressViewOffset={54 + top + styles.header.marginTop}
            refreshing={isRefreshing}
            tintColor={colors.grey500}
            colors={[colors.grey500, colors.grey500, colors.grey500, colors.grey500]}
            onRefresh={handleRefresh}
          />
        }
        data={isLoading ? [] : events}
        onEndReachedThreshold={0.5}
        onEndReached={handleLoadMore}
        renderItem={({ item }) => (
          <EventCardLarge
            key={item.id}
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
        )}
        ListHeaderComponent={
          <View style={styles.eventsHeader}>
            <Typography variant="h4" style={styles.eventsHeaderText}>
              Past Events
            </Typography>
            <Selector
              style={styles.selector}
              options={selectorOptions}
              isDisabled={isLoading}
              selectedOption={selectedOption}
              onOptionSelected={handleOptionSelect}
            />
            <Divider />
            <Typography variant="h4" style={styles.eventsHeaderText}>
              Timeframe
            </Typography>

            <DateRangePicker
              style={styles.datePicker}
              onChange={handleRangeChange}
              start={fromDate}
              end={toDate}
              isDisabled={isLoading}
              maximumDate={new Date()}
            />
            <Divider marginVertical={0} />
          </View>
        }
        ListFooterComponent={<FlatListFooterLoader isLoading={isEventsLoadingMore} />}
      />
      <View style={styles.headerContainer}>
        <View
          style={[styles.headerBackground, { height: top + styles.header.marginTop + styles.headerBackground.height }]}
        />
        <Header
          style={[styles.header, { top }]}
          withBackTitle
          endAdornmentStyle={styles.headerRight}
          startAdornmentStyle={styles.headerLeft}
          middleStyle={styles.headerMiddle}>
          <Typography variant="h6">Past Events</Typography>
        </Header>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey100 },
  bodyContainer: { paddingHorizontal: 24, gap: 24, paddingBottom: 300 },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },

  headerBackground: {
    backgroundColor: colors.grey100,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 54 / 2,
  },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    marginTop: 12,
    marginHorizontal: 12,
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

  selector: {
    marginTop: 24,
  },

  datePicker: {
    marginTop: 18,
    marginBottom: 32,
  },

  bodyEventsEmptyPlaceholder: {
    height: 200,
    flex: 1,
    backgroundColor: colors.grey300,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  bodyEventsEmptyPlaceholderText: {
    color: colors.grey400,
    width: 220,
  },
  eventsHeader: {
    marginTop: 32,
  },
  eventsHeaderText: {
    color: colors.black,
  },
});
