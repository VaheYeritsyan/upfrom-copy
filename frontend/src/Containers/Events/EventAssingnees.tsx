import React, { FC, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Team } from '@up-from/graphql/genql';
import { EventsStackParamList, Screens } from '~types/navigation';
import { KeyboardView } from '~Components/KeyboardView';
import { MainLayout } from '~Components/MainLayout';
import { ContainedButton } from '~Components/ContainedButton';
import { LargeTitleHeader } from '~Components/ScreenHeader/LargeTitleHeader';
import { colors } from '~Theme/Colors';
import { EventType } from '~types/event';
import { Selector } from '~Components/Selector';
import { IndividualEvent } from '~Components/Events/IndividualEvent';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { MyTeamEvent } from '~Components/Events/MyTeamEvent';
import { AllTeamsEvent } from '~Components/Events/AllTeamsEvent';
import { useEventAssigneesQueries } from '~Containers/Events/hooks/useEventAssigneesQueries';
import { HeaderBackButton, headerBackButtonContainerStyles } from '~Components/ScreenHeader/HeaderBackButton';
import { InviteTeamMembers } from '~Components/Events/InviteTeamMembers';
import { TeamMember } from '~types/team.js';

type EventAssigneesProps = BottomTabScreenProps<EventsStackParamList, Screens.EVENT_ASSIGNEES>;

export enum Attending {
  YES = 'Yes',
  NO = 'No',
}

const tabs = Object.values(EventType);
const attendingOptions = Object.values(Attending);

export const EventAssignees: FC<EventAssigneesProps> = ({ navigation, route }) => {
  const { currentUser } = useCurrentUserContext();

  const { isRefreshing, isLoading, refresh, teams, allTeamsCount } = useEventAssigneesQueries();

  const { imageData, ...eventData } = route.params;
  const [selectedTab, setSelectedTab] = useState(EventType.INDIVIDUAL);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [attending, setAttending] = useState(Attending.YES);
  const [invitedMembersIds, setInvitedMembersIds] = useState<string[]>([]);

  useEffect(() => {
    if (!teams.length || selectedTeam) return;

    setSelectedTeam(teams[0]);
  }, [teams]);

  const isContinueDisabled = useMemo(() => {
    switch (selectedTab) {
      case EventType.INDIVIDUAL:
        return !currentUser?.teams?.length || isLoading;
      case EventType.MY_TEAM:
        return !currentUser?.teams?.length || !invitedMembersIds.length || isLoading;

      default:
        return false;
    }
  }, [selectedTab, invitedMembersIds, currentUser?.teams?.length, isLoading]);

  const teamMembers = useMemo(() => {
    if (!selectedTeam) return [];

    return selectedTeam.members
      .filter(({ user }) => user && user.id !== currentUser?.id)
      .map(({ user, ...rest }) => ({
        ...rest,
        user: {
          id: user!.id,
          avatarUrl: user!.avatarUrl,
          firstName: user!.firstName,
          lastName: user!.lastName,
        },
      })) as TeamMember[];
  }, [selectedTeam, teams, currentUser?.id]);

  const onAttendeePress = (userId: string) => {
    navigation.navigate(Screens.USER_PROFILE, { userId });
  };

  const onMemberPress = (userId: string) => {
    setInvitedMembersIds(prevIds => {
      if (prevIds.includes(userId)) return prevIds.filter(id => id !== userId);

      return [...prevIds, userId];
    });
  };

  const handleContinuePress = () => {
    const isIndividual = selectedTab === EventType.INDIVIDUAL;
    const isOwnerAttending = selectedTab === EventType.ALL_TEAMS ? attending === Attending.YES : true;
    const teamId = selectedTab === EventType.ALL_TEAMS ? null : selectedTeam?.id!;
    const invitedIds = selectedTab === EventType.MY_TEAM ? [currentUser?.id!, ...invitedMembersIds] : [];

    navigation.navigate(Screens.EVENT_LOCATION, {
      ...eventData,
      imageData,
      isOwnerAttending,
      invitedIds,
      isIndividual,
      teamId,
    });
  };

  const handleSelectAllPress = () => {
    setInvitedMembersIds(teamMembers.map(({ user }) => user!.id));
  };

  const handleClearAllPress = () => {
    setInvitedMembersIds([]);
  };

  const stickyButtonColor = selectedTab === EventType.ALL_TEAMS ? 'purpleGradient' : 'blueGradient';
  const stickyButton = (
    <ContainedButton
      text="Continue"
      activeOpacity={0.8}
      color={stickyButtonColor}
      disabled={isContinueDisabled}
      onPress={handleContinuePress}
    />
  );

  return (
    <KeyboardView>
      <MainLayout
        containerStyle={styles.container}
        style={styles.bodyContainer}
        headerContainerStyle={headerBackButtonContainerStyles}
        stickyBottomContainerStyle={styles.stickyBottomContainer}
        isHeaderBackgroundInvisible
        header={<HeaderBackButton />}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
        stickyBottomContent={stickyButton}>
        <View style={styles.body}>
          <LargeTitleHeader title="Who is the event for?" />

          <Selector
            options={tabs}
            selectedOption={selectedTab}
            onOptionSelected={setSelectedTab as (option: EventType) => void}
          />

          {selectedTab === EventType.INDIVIDUAL ? (
            <IndividualEvent
              isLoading={!selectedTeam?.name}
              team={selectedTeam}
              teams={teams}
              handleTeamChange={setSelectedTeam}
              attendee={currentUser!}
              onAttendeePress={onAttendeePress}
            />
          ) : null}

          {selectedTab === EventType.MY_TEAM ? (
            <MyTeamEvent
              isLoading={!selectedTeam?.name}
              teams={teams}
              team={selectedTeam}
              handleTeamChange={setSelectedTeam}
              attendee={currentUser!}
              onAttendeePress={onAttendeePress}>
              <InviteTeamMembers
                teamMembers={teamMembers}
                invitedMembersIds={invitedMembersIds}
                onTeamMemberPress={onMemberPress}
                onSelectAllPress={handleSelectAllPress}
                onClearAllPress={handleClearAllPress}
              />
            </MyTeamEvent>
          ) : null}

          {selectedTab === EventType.ALL_TEAMS ? (
            <AllTeamsEvent teamsCount={allTeamsCount}>
              <Selector
                style={styles.attendingSelector}
                options={attendingOptions}
                selectedOption={attending}
                onOptionSelected={setAttending as (option: string) => void}
              />
            </AllTeamsEvent>
          ) : null}
        </View>
      </MainLayout>
    </KeyboardView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey100 },
  bodyContainer: {
    marginHorizontal: 24,
  },
  body: {
    gap: 32,
  },
  attendingSelector: {
    width: 119,
  },
  stickyBottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
