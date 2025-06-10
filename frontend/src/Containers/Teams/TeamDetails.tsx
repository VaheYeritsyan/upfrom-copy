import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { Badge } from '~Components/Badge';
import { Header } from '~Components/ScreenHeader/Header';
import { Selector } from '~Components/Selector';
import { TeamInfo } from '~Components/Teams/TeamInfo';
import { TeamMembers } from '~Components/Teams/TeamMembers';
import { useTeamQueries } from '~Containers/Teams/hooks/useTeamQueries';
import { EntityInfo } from '~Components/EntityInfo';
import { MainLayout } from '~Components/MainLayout';
import { FullScreenLoader } from '~Components/Loader/FullScreenLoader';
import { colors } from '~Theme/Colors';
import { useChatClient } from '~Components/ChatClient/hooks/useChatClient';
import { useChatContext } from '~Context/ChatContext';
import { ProfileStackParamList, Screens, Stacks } from '~types/navigation';
import { CommonActions } from '@react-navigation/native';
import { EventsFilter } from '~types/event';

type TeamsProps = BottomTabScreenProps<ProfileStackParamList, Screens.TEAM_DETAILS>;

enum SelectorOptions {
  TEAM_INFO = 'Team',
  TEAM_MEMBERS = 'Members',
}

const selectorOptions = Object.values(SelectorOptions);

export function TeamDetails({ navigation, route }: TeamsProps) {
  const { teamId } = route.params;

  const [selectedOption, setSelectedOption] = useState(SelectorOptions.TEAM_INFO);

  const teamData = useTeamQueries(teamId);

  const { getTeamChannel } = useChatClient();
  const { setChannel } = useChatContext();
  const handleMessagePress = async () => {
    const teamChannel = await getTeamChannel(teamId);
    if (teamChannel) {
      setChannel(teamChannel);
      navigation.navigate(Screens.MESSAGES_CHANNEL);
    }
  };

  const handleMemberPress = (userId: string) => {
    navigation.navigate(Screens.USER_PROFILE, { userId });
  };

  const handleEventsPress = () => {
    const state = navigation.getParent()?.getState();
    if (!state) return;

    const routes = [
      ...state.routes.filter(({ name }) => name !== Stacks.EVENTS),
      {
        name: Stacks.EVENTS,
        state: {
          index: 0,
          routes: [{ name: Screens.EVENTS, params: { eventsFilter: EventsFilter.TEAM } }],
        },
      },
    ];

    navigation.dispatch(CommonActions.reset({ ...state, index: routes.length - 1, routes }));
  };

  if (teamData.isLoading || !teamData?.team) return <FullScreenLoader style={styles.container} />;

  const { name, description, imageUrl, createdAt } = teamData.team;
  const members = teamData.members;

  return (
    <MainLayout
      containerStyle={styles.container}
      style={styles.bodyContainer}
      onRefresh={teamData.refresh}
      isRefreshing={teamData.isRefreshing}
      header={
        <Header>
          <EntityInfo
            fullName={name}
            avatarSize={26}
            gap={8}
            badge={<Badge text="Team" />}
            avatarUrl={imageUrl ?? undefined}
            avatarType="square"
            typographyVariant="body1SemiBold"
          />
        </Header>
      }>
      <Selector
        options={selectorOptions}
        selectedOption={selectedOption}
        onOptionSelected={(option: SelectorOptions) => setSelectedOption(option)}
      />

      <View style={styles.bodyContent}>
        {selectedOption === SelectorOptions.TEAM_INFO ? (
          <TeamInfo
            name={name}
            role={teamData.team.myMembership?.role || ''}
            organization={teamData.organization}
            description={description}
            createdAt={createdAt}
            imageUrl={imageUrl ?? undefined}
            membersCount={members.length}
            handleMessagePress={handleMessagePress}
            handleEventsPress={handleEventsPress}
          />
        ) : null}

        {selectedOption === SelectorOptions.TEAM_MEMBERS ? (
          <TeamMembers members={members} onMemberPress={handleMemberPress} />
        ) : null}
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey100 },
  headerText: {
    alignItems: 'center',
  },
  bodyContainer: {
    marginHorizontal: 24,
    marginTop: 18,
  },
  bodyContent: {
    marginTop: 32,
  },
  bodyTeamInfo: {
    gap: 32,
  },
  bodyHeadline: {
    color: colors.black,
  },
  bodySectionName: {
    color: colors.black,
  },
  bodyTeamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bodyDescription: {
    marginTop: 18,
    color: colors.grey500,
  },
  bodyFeatures: {
    gap: 16,
  },
  bodyTeamLinks: {
    marginTop: 18,
    gap: 8,
    flexDirection: 'row',
  },
  textBlack: {
    color: colors.black,
  },
});
