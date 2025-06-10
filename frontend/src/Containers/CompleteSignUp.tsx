import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Team } from '@up-from/graphql/genql';
import { Typography } from '~Components/Typography';
import { ContainedButton } from '~Components/ContainedButton';
import { MainLayout } from '~Components/MainLayout';
import { KeyboardView } from '~Components/KeyboardView';
import { ProfileForm } from '~Components/Profile/ProfileForm';
import { useEditProfileFrom } from '~Hooks/useEditProfileFrom';
import { colors } from '~Theme/Colors';
import { EntityCard } from '~Components/EntityCard';
import { Building, Profile2User } from 'iconsax-react-native';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { effects } from '~Theme/Effects';
import { Divider } from '~Components/Divider';
import { getOrganizationsFromTeams } from '~utils/organizationAndTeams';
import { EntityTeamInfoWithFooter } from '~Components/EntityTeamInfoFooter';
import { getColorFromString } from '~utils/color';
import { getAvatarImageOrganizationBadge } from '~Components/Avatar/avatarImageOrganizationBadge';

export function CompleteSignUp() {
  const { currentUser } = useCurrentUserContext();
  const { control, isSubmitDisabled, handleSubmit, handleSelectLocation } = useEditProfileFrom('completeSignUp');

  const teams = useMemo(() => {
    if (!currentUser?.teams) return [];

    return currentUser?.teams as Team[];
  }, [currentUser?.teams]);

  const organizations = getOrganizationsFromTeams(teams);

  return (
    <KeyboardView>
      <MainLayout
        style={styles.content}
        containerStyle={styles.container}
        stickyBottomContainerStyle={styles.stickyBottomContainer}
        stickyBottomContent={
          <ContainedButton text="Submit" color="blueGradient" disabled={isSubmitDisabled} onPress={handleSubmit} />
        }>
        <View>
          <Typography align="center" variant="h1">
            Welcome to
          </Typography>
          <Typography align="center" variant="h1" primaryGradient>
            UpFrom
          </Typography>
          <Typography style={styles.bodyText} align="center" variant="paragraph1">
            You've been successfully registered to the platform. Complete your profile details below.
          </Typography>
        </View>

        <View style={styles.accessContainers}>
          {organizations.length ? (
            <View style={styles.listContainer}>
              <View style={styles.listContainerHeader}>
                <Building color={colors.primaryMain} variant="Bulk" size={18} />
                <Typography style={styles.listContainerHeaderText} variant="h6">
                  Organization
                </Typography>
              </View>
              <View style={styles.listOrganizations}>
                {organizations.map(organization => (
                  <EntityCard
                    key={organization.id}
                    style={styles.teamCard}
                    name={organization.name}
                    avatarSize={40}
                    avatarBgColor={getColorFromString(organization.id)}
                    typographyVariant="h5"
                    avatarType="hexagon"
                    avatarInitialsColor={colors.white}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {teams.length ? (
            <View>
              <View style={styles.listContainer}>
                <View style={styles.listContainerHeader}>
                  <Profile2User color={colors.primaryMain} variant="Bulk" size={18} />
                  <Typography style={styles.listContainerHeaderText} variant="h6">
                    Team Access
                  </Typography>
                </View>
                <View style={styles.list}>
                  {teams.map(team => (
                    <EntityCard
                      key={team.id}
                      style={styles.teamCard}
                      name={team.name}
                      avatarSize={56}
                      typographyVariant="h5"
                      avatarType="square"
                      avatarUrl={team.imageUrl ?? undefined}
                      AvatarBadge={getAvatarImageOrganizationBadge(team.organization, true)}>
                      <EntityTeamInfoWithFooter assignedAs={team.myMembership?.role} />
                    </EntityCard>
                  ))}
                </View>
              </View>
              <Divider />
            </View>
          ) : null}
        </View>

        <View style={styles.titleContainer}>
          <Typography variant="h4" align="center">
            Profile Details
          </Typography>
          <Typography style={styles.completeSubtitleText} variant="body1Medium" align="center">
            Complete your profile details
          </Typography>
        </View>
        <ProfileForm style={styles.form} control={control} onSelectLocation={handleSelectLocation} />
      </MainLayout>
    </KeyboardView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    marginTop: 50,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  fieldsSection: {
    marginBottom: 10,
    paddingBottom: 200,
  },
  bodyText: {
    marginTop: 28,
    marginHorizontal: 25,
    color: colors.grey400,
  },
  form: {
    marginTop: 32,
  },
  stickyBottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  accessContainers: {
    gap: 12,
    marginTop: 32,
  },
  listContainer: {
    ...effects.shadow1,
    padding: 20,
    borderRadius: 8,
    gap: 20,
    borderWidth: 0.5,
    borderColor: colors.grey200,
    backgroundColor: colors.white,
  },
  listContainerHeader: {
    flexDirection: 'row',
    gap: 6,
  },
  listContainerHeaderText: {
    color: colors.primaryMain,
  },
  list: {
    gap: 20,
  },
  listOrganizations: {
    gap: 8,
  },
  teamCard: {
    shadowOpacity: 0,
    elevation: 0,
    padding: 0,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  titleContainer: {
    gap: 4,
  },
  completeSubtitleText: {
    color: colors.grey400,
  },
});
