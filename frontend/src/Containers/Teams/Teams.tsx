import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { InfoCircle } from 'iconsax-react-native';
import { HomeStackParamList, Screens } from '~types/navigation';
import { getColorFromString } from '~utils/color';
import { useTeamsQueries } from '~Containers/Teams/hooks/useTeamsQueries';
import { Header } from '~Components/ScreenHeader/Header';
import { EntityInfo } from '~Components/EntityInfo';
import { MainLayout } from '~Components/MainLayout';
import { FullScreenLoader } from '~Components/Loader/FullScreenLoader';
import { Typography } from '~Components/Typography';
import { EntityCard } from '~Components/EntityCard';
import { EntityTeamInfoWithFooter } from '~Components/EntityTeamInfoFooter';
import { getAvatarImageOrganizationBadge } from '~Components/Avatar/avatarImageOrganizationBadge';
import { Divider } from '~Components/Divider';
import { colors } from '~Theme/Colors';
import { useOrganizationModalsContext } from '~Hooks/useOrganizationContext';

type TeamsProps = BottomTabScreenProps<HomeStackParamList, Screens.TEAMS>;

export function Teams({ navigation }: TeamsProps) {
  const teamsData = useTeamsQueries();
  const { setOrganizationMeta } = useOrganizationModalsContext();

  const handleTeamPress = (teamId: string) => {
    navigation.navigate(Screens.TEAM_DETAILS, { teamId });
  };

  const handleOrganizationsPress = (organization: any) => {
    setOrganizationMeta(organization);
  };

  if (teamsData.isLoading || !teamsData?.teams.length || !teamsData.organizations)
    return <FullScreenLoader style={styles.container} />;

  return (
    <MainLayout
      containerStyle={styles.container}
      style={styles.bodyContainer}
      onRefresh={teamsData.refresh}
      isRefreshing={teamsData.isRefreshing}
      header={
        <Header
          style={styles.pageHeader}
          startAdornmentStyle={styles.headerLeft}
          middleStyle={styles.headerMiddle}
          withBackTitle
          endAdornmentStyle={styles.headerRight}>
          <Typography variant="h6">Teams</Typography>
        </Header>
      }>
      <View style={styles.bodyContent}>
        <View style={styles.bodyListContainer}>
          <Typography variant="h4">Your Teams</Typography>

          <View style={styles.bodyListTeams}>
            {teamsData.teams.map(team => (
              <EntityCard
                contentStyle={styles.teamCardContent}
                key={team.id}
                name={team.name}
                avatarSize={56}
                avatarType="square"
                typographyVariant="h5"
                avatarUrl={team.imageUrl ?? undefined}
                AvatarBadge={getAvatarImageOrganizationBadge(team.organization)}
                isArrowVisible
                onPress={() => handleTeamPress(team.id)}>
                <EntityTeamInfoWithFooter assignedAs={team.myMembership?.role} />
              </EntityCard>
            ))}
          </View>
        </View>

        <Divider />

        <View style={styles.bodyListContainer}>
          <Typography variant="h4">Organizations</Typography>

          <View style={styles.bodyListOrganizations}>
            {teamsData.organizations.map(organization => (
              <TouchableOpacity
                key={organization.id}
                onPress={() => handleOrganizationsPress(organization)}
                activeOpacity={0.8}>
                <EntityInfo
                  fullName={organization.name}
                  avatarSize={40}
                  avatarType="hexagon"
                  typographyVariant="h5"
                  avatarInitialsColor={colors.white}
                  avatarBgColor={getColorFromString(organization.id)}
                  endAdornment={<InfoCircle color={colors.grey400} size={18} variant="Bold" />}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey100 },
  pageHeader: {
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
  teamCardContent: {
    gap: 6,
  },
  bodyContainer: {
    marginHorizontal: 24,
  },
  bodyContent: {
    marginTop: 32,
  },
  bodyListContainer: {
    gap: 24,
  },
  bodyListTeams: {
    gap: 12,
  },
  bodyListOrganizations: {
    gap: 8,
  },
});
