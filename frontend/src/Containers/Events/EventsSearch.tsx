import React, { FC, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CloseCircle } from 'iconsax-react-native';
import { EventsStackParamList, Screens } from '~types/navigation';
import { LargeTitleHeader } from '~Components/ScreenHeader/LargeTitleHeader';
import { Typography } from '~Components/Typography';
import { SearchTextField } from '~Components/Field/SearchTextField';
import { Button } from '~Components/Button';
import { colors } from '~Theme/Colors';
import { useSearchEventsQueries } from '~Containers/Events/hooks/useSearchEventsQueries';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardView } from '~Components/KeyboardView';
import { FullScreenLoader } from '~Components/Loader/FullScreenLoader';
import { FlatListFooterLoader } from '~Components/Loader/FlatListFooterLoader';
import { EmptyPlaceholder } from '~Components/EmptyPlaceholder';
import { EventCardSmall } from '~Components/EventCard/EventCardSmall';

type Props = BottomTabScreenProps<EventsStackParamList, Screens.EVENTS_SEARCH>;

export const EventsSearch: FC<Props> = ({ navigation, route }) => {
  const paramsQuery = route.params?.query;

  const { top } = useSafeAreaInsets();

  const [query, setQuery] = useState(paramsQuery || '');
  const { events, isLoading, ...pagination } = useSearchEventsQueries(query);

  const endAdornment = (
    <Button
      style={styles.searchEndButton}
      onPress={navigation.goBack}
      activeOpacity={0.6}
      text="Close"
      shape="pill"
      size="small"
      color="white"
      endAdornment={<CloseCircle color={colors.grey400} size={14} variant="Bold" />}
    />
  );

  const handleSearchQueryChange = (value: string) => {
    setQuery(value);
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate(Screens.EVENT_DETAILS, { eventId });
  };

  return (
    <KeyboardView>
      <FlatList
        style={styles.container}
        contentContainerStyle={[styles.bodyContainer, { paddingTop: top }]}
        data={isLoading ? [] : events}
        keyExtractor={({ id }) => id}
        ListFooterComponent={<FlatListFooterLoader isLoading={pagination.isLoadingMore} />}
        onEndReached={pagination.loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          isLoading ? (
            <FullScreenLoader style={styles.container} />
          ) : (
            <EmptyPlaceholder title="No results were found." height={74} />
          )
        }
        renderItem={({ item }) => (
          <EventCardSmall
            key={item.id}
            id={item.id}
            startsAt={item.startsAt}
            endsAt={item.endsAt}
            team={item.team}
            imageUrl={item.imageUrl}
            title={item.title}
            onPress={handleEventPress}
          />
        )}
        ListHeaderComponent={
          <>
            <LargeTitleHeader title="Events" style={styles.header} />
            <SearchTextField
              style={styles.search}
              autoFocus
              placeholder="Type to search"
              onChangeText={handleSearchQueryChange}
              endAdornment={endAdornment}
            />
            <Typography variant="body1SemiBold">Results</Typography>
          </>
        }
      />
    </KeyboardView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey100 },
  bodyContainer: { paddingHorizontal: 24, gap: 12, paddingBottom: 200 },
  content: { flex: 1, marginTop: 20, gap: 24 },
  search: {
    marginTop: 20,
    marginBottom: 32,
  },
  searchEndButton: {
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: { flex: 1 },
  card: {
    padding: 14,
    gap: 14,
  },
  cardContent: {
    height: 58,
    gap: 22,
    justifyContent: 'space-between',
  },
  cardFeature: {
    gap: 4,
  },
  footer: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
