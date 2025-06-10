import React, { memo, useMemo } from 'react';
import { StyleSheet, View, InteractionManager, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';

import { Screens } from '~types/navigation';
import { getColorFromString } from '~utils/color';
import { navigationRef } from '~utils/navigation';
import { useOrganizationModalsContext } from '~Hooks/useOrganizationContext';
import { EntityInfo } from '~Components/EntityInfo';
import { useOrganizationQueries } from '~Components/Organizations/hooks/useOrganizationQueries';
import { getAvatarImageOrganizationBadge } from '~Components/Avatar/avatarImageOrganizationBadge';
import { EntityTeamInfoWithFooter } from '~Components/EntityTeamInfoFooter';
import { Typography } from '~Components/Typography';
import { EntityCard } from '~Components/EntityCard';
import { ActionModal } from '~Components/Modals/ActionModal';
import { EmptyPlaceholder } from '~Components/EmptyPlaceholder';
import { FullScreenLoader } from '~Components/Loader/FullScreenLoader';
import { colors } from '~Theme/Colors';

const screenHeight = Dimensions.get('window').height;

export const OrganizationDetailsModal = memo(() => {
  const { top, bottom } = useSafeAreaInsets();

  const { organizationMeta, setOrganizationMeta } = useOrganizationModalsContext();
  const { organization, isLoading, refresh, isRefreshing, teams } = useOrganizationQueries(organizationMeta?.id);

  const isTheSameOrg = organizationMeta?.id === organization?.id;
  const orgName = (isTheSameOrg ? organization?.name || organizationMeta?.name : organizationMeta?.name) as string;
  const orgDetails = isTheSameOrg ? organization?.details || organizationMeta?.details : organizationMeta?.details;

  const padding = useMemo(() => {
    return top ? 200 : 250;
  }, [top]);

  const height = useMemo(() => {
    const modalHeight = screenHeight - top - bottom;

    return modalHeight - padding;
  }, [top, bottom, padding]);

  const handleTeamPress = (teamId: string) => {
    setOrganizationMeta(null);
    InteractionManager.runAfterInteractions(() => {
      navigationRef.dispatch(CommonActions.navigate(Screens.TEAM_DETAILS, { teamId }));
    });
  };

  const handleClose = () => {
    setOrganizationMeta(null);
  };

  const AvatarBadge = getAvatarImageOrganizationBadge((organization || organizationMeta)!);

  return (
    <ActionModal isVisible={!!organizationMeta} height={height + padding} isCustom onClose={handleClose}>
      <ScrollView
        style={{ height }}
        contentContainerStyle={[styles.bodyContainerContent]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            progressBackgroundColor={colors.white}
            tintColor={colors.grey500}
            colors={[colors.grey500, colors.grey500, colors.grey500, colors.grey500]}
            onRefresh={refresh}
          />
        }>
        <View style={styles.bodyContent}>
          <Typography variant="h4">Organization</Typography>

          <EntityInfo
            fullName={orgName}
            avatarSize={56}
            gap={12}
            avatarType="hexagon"
            avatarInitialsColor={colors.white}
            avatarBgColor={getColorFromString(organizationMeta?.id)}
            typographyVariant="h3"
          />

          <View style={styles.bodySection}>
            <Typography style={styles.bodySectionName} variant="body1SemiBold">
              Details
            </Typography>
            <Typography style={styles.bodyDescription} variant="paragraph2">
              {orgDetails}
            </Typography>
          </View>
        </View>

        <View style={styles.bodySection}>
          <Typography style={styles.bodySectionName} variant="body1SemiBold">
            Team Access
          </Typography>

          <View style={styles.bodySection}>
            {isLoading ? (
              <FullScreenLoader style={styles.loader} />
            ) : (
              teams.map(team => (
                <EntityCard
                  key={team.id}
                  style={styles.teamCard}
                  contentStyle={styles.teamCardContent}
                  name={team.name}
                  avatarSize={56}
                  avatarType="square"
                  avatarUrl={team.imageUrl || undefined}
                  typographyVariant="h5"
                  isArrowVisible
                  onPress={() => handleTeamPress(team.id)}
                  AvatarBadge={AvatarBadge}>
                  <EntityTeamInfoWithFooter assignedAs={team.myMembership?.role} />
                </EntityCard>
              ))
            )}

            {!isLoading && !teams.length ? <EmptyPlaceholder title="No teams" height={75} /> : null}
          </View>
        </View>
      </ScrollView>
    </ActionModal>
  );
});

const styles = StyleSheet.create({
  bodyContainerContent: {
    paddingBottom: 32,
    gap: 24,
  },
  bodyContent: {
    gap: 32,
  },
  bodySectionName: {
    color: colors.black,
  },
  bodyDescription: {
    color: colors.grey500,
  },
  bodySection: {
    gap: 18,
  },
  teamCard: {
    padding: 0,
    shadowColor: 'transparent',
    shadowRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  teamCardContent: {
    gap: 6,
  },
  loader: {
    height: 100,
  },
});
