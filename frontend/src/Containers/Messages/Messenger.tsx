import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useChatClient } from '~Components/ChatClient/hooks/useChatClient';
import { ChannelList } from 'stream-chat-react-native';
import { Team } from '@up-from/graphql/genql';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatContext } from '~Context/ChatContext';
import { colors } from '~Theme/Colors';
import { Edit } from 'iconsax-react-native';
import { Channel, ChannelMemberResponse, DefaultGenerics } from 'stream-chat';
import { NewMessageModal } from '~Components/NewMessageModal';
import { MessengerStackParamList, Screens } from '~types/navigation';
import { LargeTitleHeader } from '~Components/ScreenHeader/LargeTitleHeader';
import { FullScreenLoader } from '~Components/Loader/FullScreenLoader';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { PreviewMessenger } from '~Components/ChatClient/PreviewMessenger';
import { SearchTextField } from '~Components/Field/SearchTextField';
import { Button } from '~Components/Button';
import { Divider } from '~Components/Divider';

type MessengerProps = BottomTabScreenProps<MessengerStackParamList, Screens.MESSENGER>;

enum Filers {
  ALL_MESSAGES = 'All Messages',
  DIRECT = 'Direct',
  GROUPS = 'Groups',
  TEAMS = 'Teams',
}

const filtersValues = Object.values(Filers) as Filers[];
const LoadingIndicator = () => <FullScreenLoader />;

export function Messenger({ navigation }: MessengerProps) {
  const { currentUser } = useCurrentUserContext();
  const { getTeamUsers, filterTeamParticipants } = useChatClient();
  const { clientIsReady } = useChatContext();
  const { top } = useSafeAreaInsets();
  const { setChannel } = useChatContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState<ChannelMemberResponse<DefaultGenerics>[] | undefined>(undefined);
  const [selectedFilter, setSelectedFilter] = useState(Filers.ALL_MESSAGES);
  const sort = {
    has_unread: -1,
  };
  const commonFilter = {
    members: { $in: [currentUser?.id] },
  };

  const isCreateDisabled = !currentUser?.teams?.length;

  const teams = useMemo(() => {
    if (!currentUser?.teams?.length) return [];

    return currentUser.teams as Team[];
  }, [currentUser?.teams]);

  const teamsIds = useMemo(() => {
    if (!teams.length) return;

    return teams.map(({ id }) => id);
  }, [teams]);

  const filters = useMemo(() => {
    switch (selectedFilter) {
      case Filers.ALL_MESSAGES:
        return commonFilter;

      case Filers.DIRECT:
        return {
          ...commonFilter,
          member_count: { $eq: 3 },
        };

      case Filers.GROUPS:
        return {
          ...commonFilter,
          member_count: { $gte: 3 },
          id: { $nin: teamsIds },
        };

      case Filers.TEAMS:
        return {
          ...commonFilter,
          id: { $in: teamsIds },
        };

      default:
        return commonFilter;
    }
  }, [commonFilter, selectedFilter, teamsIds]);

  const redirectToDirectChannel = (channel?: Channel) => {
    setModalVisible(false);
    if (channel) setChannel(channel);
    navigation.navigate(Screens.MESSAGES_CHANNEL);
  };

  const handleSearchPress = () => {
    navigation.navigate(Screens.MESSAGES_SEARCH);
  };

  const openUsersList = useCallback(async () => {
    setModalVisible(true);
    const usersList = await getTeamUsers();
    if (usersList) {
      const participants = filterTeamParticipants(usersList);
      setUsers(participants);
    }
  }, [getTeamUsers, filterTeamParticipants]);

  return (
    <>
      {users && (
        <NewMessageModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          teams={teams}
          users={users}
          redirectToDirectChannel={redirectToDirectChannel}
        />
      )}

      {clientIsReady ? (
        <ChannelList
          LoadingIndicator={LoadingIndicator}
          ListHeaderComponent={() => (
            <Fragment key={selectedFilter}>
              <View style={styles.wrapper}>
                <LargeTitleHeader
                  style={[styles.header, { paddingTop: top + 32 }]}
                  title="Messages"
                  endAdornment={
                    isCreateDisabled ? null : (
                      <Edit
                        color={colors.primaryMain}
                        variant="Linear"
                        size={24}
                        style={styles.icon}
                        onPress={() => {
                          openUsersList();
                        }}
                      />
                    )
                  }
                />
                <SearchTextField placeholder="Search" editable={false} onContainerPress={handleSearchPress} />
              </View>
              <ScrollView
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersBody}
                showsHorizontalScrollIndicator={false}
                horizontal>
                {filtersValues.map(filter => {
                  const handleFilterPress = () => {
                    setSelectedFilter(filter);
                  };

                  return (
                    <Button
                      key={filter}
                      text={filter}
                      color={filter === selectedFilter ? 'blueGradient' : 'white'}
                      size="small"
                      onPress={handleFilterPress}
                    />
                  );
                })}
              </ScrollView>

              <View style={styles.wrapper}>
                <Divider style={styles.divider} marginVertical={0} />
              </View>
            </Fragment>
          )}
          // There is an error in data types in stream-chat library, will update it after they will fix an issue
          // @ts-ignore
          sort={sort}
          // There is an error in data types in stream-chat library, will update it after they will fix an issue
          // @ts-ignore
          filters={filters}
          Preview={props => <PreviewMessenger {...props} style={styles.wrapper} />}
          additionalFlatListProps={{
            contentContainerStyle: [styles.body],
          }}
          onSelect={channel => {
            // There is an error in data types in stream-chat library, will update it after they will fix an issue
            // @ts-ignore
            setChannel(channel);
            navigation.navigate(Screens.MESSAGES_CHANNEL);
          }}
        />
      ) : (
        <FullScreenLoader />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey100 },
  body: { backgroundColor: colors.grey100, paddingBottom: 200 },
  wrapper: {
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 18,
  },
  icon: {
    alignItems: 'center',
  },
  filtersContainer: {
    paddingTop: 24,
    paddingBottom: 24,
    height: 80,
    minHeight: 80,
  },
  filtersBody: {
    paddingHorizontal: 24,
    gap: 6,
  },
  divider: {
    marginBottom: 24,
  },
});
