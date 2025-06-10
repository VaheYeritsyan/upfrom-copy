import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { LatestMessagePreview } from 'stream-chat-react-native';
import { CloseCircle } from 'iconsax-react-native';
import { Channel, MessageResponse } from 'stream-chat';
import { EventsStackParamList, Screens } from '~types/navigation';
import { LargeTitleHeader } from '~Components/ScreenHeader/LargeTitleHeader';
import { Typography } from '~Components/Typography';
import { SearchTextField } from '~Components/Field/SearchTextField';
import { Button } from '~Components/Button';
import { colors } from '~Theme/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardView } from '~Components/KeyboardView';
import { FullScreenLoader } from '~Components/Loader/FullScreenLoader';
import { FlatListFooterLoader } from '~Components/Loader/FlatListFooterLoader';
import { EmptyPlaceholder } from '~Components/EmptyPlaceholder';
import { PreviewMessengerCard, Props as PreviewMessengerCardProps } from '~Components/ChatClient/PreviewMessengerCard';
import { useChatContext } from '~Context/ChatContext';
import { useDebounce } from '~Hooks/useDebouce';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { showAlert } from '~utils/toasts';

type Props = BottomTabScreenProps<EventsStackParamList, Screens.MESSAGES_SEARCH>;

type Result = {
  message: MessageResponse;
  channel: Channel | null;
};

export const MessagesSearch: FC<Props> = ({ navigation, route }) => {
  const paramsQuery = route.params?.query;
  const channelsCacheRef = useRef(new Map<Channel['id'], Channel>());

  const { top } = useSafeAreaInsets();
  const { chatClient, setChannel, setThread } = useChatContext();
  const { currentUser } = useCurrentUserContext();

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [query, setQuery] = useState(paramsQuery || '');
  const [results, setResults] = useState<Result[]>([]);
  const [hasNext, setHasNext] = useState(true);
  const debouncedQuery = useDebounce(query);

  const getChannel = useCallback((type?: string, id?: string) => {
    if (!type || !id) return null;

    const cachedChannel = channelsCacheRef.current.get(id);
    if (cachedChannel) return cachedChannel;

    const channel = chatClient?.getChannelById(type, id, {});
    if (!channel) return null;

    channelsCacheRef.current.set(channel.id, channel);

    return channel;
  }, []);

  const getMessages = useCallback(
    async (query: string, offset = 0, limit = 10) => {
      if (!currentUser?.id) return;

      setIsLoading(true);
      try {
        const res = await chatClient?.search(
          { members: { $in: [currentUser.id] } },
          { text: { $autocomplete: query } },
          { limit, offset },
        );
        if (!res) {
          setIsLoading(false);
          setResults(prevResults => (offset ? prevResults : []));
          return;
        }

        const messages = res.results.map(({ message }) => message);

        const results = messages
          .map(message => ({
            message,
            channel: getChannel(message.channel?.type, message.channel?.id),
          }))
          .filter(result => !!result.channel);

        setHasNext(messages.length === limit);
        setResults(prevResults => (offset ? [...prevResults, ...results] : results));
      } catch {
        showAlert('Failed to search the messages');
      } finally {
        setIsLoading(false);
      }
    },
    [chatClient, query, currentUser?.id, isLoading],
  );

  useEffect(() => {
    if (!currentUser?.id || !debouncedQuery) return;

    getMessages(debouncedQuery, 0);
  }, [debouncedQuery]);

  useEffect(() => {
    if (query) return;

    setResults([]);
    setHasNext(true);
  }, [query]);

  const loadMoreMessages = async () => {
    if (!hasNext || !results.length || isLoading || !debouncedQuery) return;
    await getMessages(debouncedQuery, results.length);
  };

  const refreshMessages = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    await getMessages(debouncedQuery, 0);
    setIsRefreshing(false);
  }, [getMessages, debouncedQuery, isRefreshing]);

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

  const handleResultPress = (message: MessageResponse) => async (channel: Channel) => {
    setChannel(channel);

    if (message.parent_id) {
      const thread = await channel.getMessagesById([message.parent_id]);
      // There is an error in data types in stream-chat library, will update it after they will fix an issue
      // @ts-ignore
      setThread(thread.messages[0]);
      navigation.navigate(Screens.REPLY_THREAD, { messageId: message.id });
    } else {
      navigation.navigate(Screens.MESSAGES_CHANNEL, { messageId: message.id });
    }
  };

  return (
    <KeyboardView>
      <FlatList
        style={styles.container}
        contentContainerStyle={[styles.bodyContainer, { paddingTop: top }]}
        data={!results.length && isLoading ? [] : results}
        keyExtractor={({ message }) => message.id}
        ListFooterComponent={<FlatListFooterLoader isLoading={!!results.length && isLoading} />}
        onEndReached={loadMoreMessages}
        refreshControl={
          <RefreshControl
            progressViewOffset={top}
            refreshing={isRefreshing}
            progressBackgroundColor={styles.container.backgroundColor}
            tintColor={colors.grey500}
            colors={[colors.grey500, colors.grey500, colors.grey500, colors.grey500]}
            onRefresh={refreshMessages}
          />
        }
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          isLoading ? (
            <FullScreenLoader style={styles.container} />
          ) : (
            <EmptyPlaceholder title="No results were found." height={74} />
          )
        }
        renderItem={({ item }) => (
          <PreviewMessengerCard
            key={item.message.id}
            channel={item.channel as unknown as PreviewMessengerCardProps['channel']}
            latestMessagePreview={{ messageObject: item.message } as LatestMessagePreview}
            onPress={handleResultPress(item.message)}
          />
        )}
        ListHeaderComponent={
          <>
            <LargeTitleHeader title="Messages" style={styles.header} />
            <SearchTextField
              style={styles.search}
              autoFocus
              placeholder="Type to search"
              onChangeText={handleSearchQueryChange}
              endAdornment={endAdornment}
            />
            <Typography style={styles.results} variant="body1SemiBold">
              Results
            </Typography>
          </>
        }
      />
    </KeyboardView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey100 },
  bodyContainer: { paddingHorizontal: 24, paddingBottom: 200 },
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
  results: {
    marginBottom: 12,
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
