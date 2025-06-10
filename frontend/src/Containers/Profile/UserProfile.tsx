import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '~Theme/Colors';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Calendar, Setting2, Send2, InfoCircle, Location } from 'iconsax-react-native';
import { Header } from '~Components/ScreenHeader/Header';
import { Typography } from '~Components/Typography';
import { MainLayout } from '~Components/MainLayout';
import { useProfileAboutQueries } from '~Containers/Profile/hooks/useProfileAboutQueries';
import { Feature } from '~Components/Feature';
import { Divider } from '~Components/Divider';
import { SmallIconButton } from '~Components/SmallIconButton';
import { getMonthAndYear } from '~utils/dateFormat';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { EntityInfo } from '~Components/EntityInfo';
import { FullScreenLoader } from '~Components/Loader/FullScreenLoader';
import { useChatClient } from '~Components/ChatClient/hooks/useChatClient';
import { useChatContext } from '~Context/ChatContext';
import { ProfileStackParamList, Screens } from '~types/navigation';
import { EntityCard } from '~Components/EntityCard';
import { showAlert } from '~utils/toasts';
import { getAvatarImageOrganizationBadge } from '~Components/Avatar/avatarImageOrganizationBadge';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { getColorFromString } from '~utils/color';
import { useOrganizationModalsContext } from '~Hooks/useOrganizationContext';

type UserProfileProps = BottomTabScreenProps<ProfileStackParamList, Screens.USER_PROFILE | Screens.OWN_PROFILE>;

export function UserProfile({ navigation, route }: UserProfileProps) {
  const { currentUser } = useCurrentUserContext();
  const { setOrganizationMeta } = useOrganizationModalsContext();
  const { createDirectMessageChannel } = useChatClient();

  const userIdFromParams = route.params?.userId;
  const userId = userIdFromParams || currentUser?.id;
  const { user, teams, organizations, isLoading, isRefreshing, refresh } = useProfileAboutQueries(userId);

  const fullName = `${user?.firstName} ${user?.lastName}`;
  const date = getMonthAndYear(user?.createdAt);
  const isCurrentUser = currentUser?.id === userId;
  const { setChannel } = useChatContext();

  const handleTeamPress = (teamId: string) => {
    navigation.navigate(Screens.TEAM_DETAILS, { teamId });
  };

  const handleOrganizationPress = (organization: any) => {
    setOrganizationMeta(organization);
  };

  const handleSettingsPress = () => {
    navigation.navigate(Screens.PROFILE_SETTINGS);
  };

  const handleMessagePress = async () => {
    if (userId) {
      const newChannel = await createDirectMessageChannel([userId]);
      if (newChannel) {
        setChannel(newChannel);
        navigation.navigate(Screens.MESSAGES_CHANNEL);
      } else {
        showAlert('Failed to create channel, try again');
      }
    }
  };

  const endAdornmentElement = isCurrentUser ? (
    <SmallIconButton Icon={Setting2} iconSize={16} text="Settings" isBordered onPress={handleSettingsPress} />
  ) : (
    <SmallIconButton Icon={Send2} iconSize={16} text="Message" isBordered onPress={handleMessagePress} />
  );

  if (isLoading || !user) return <FullScreenLoader style={styles.container} />;

  return (
    <MainLayout
      containerStyle={styles.container}
      style={styles.bodyContainer}
      isRefreshing={isRefreshing}
      onRefresh={refresh}
      header={
        <Header isBackArrowInvisible={!userIdFromParams} endAdornment={endAdornmentElement}>
          <EntityInfo
            fullName={fullName}
            avatarSize={26}
            gap={8}
            avatarUrl={user.avatarUrl ?? undefined}
            typographyVariant="body1SemiBold"
          />
        </Header>
      }>
      <View style={styles.body}>
        <EntityInfo
          fullName={fullName}
          avatarUrl={user.avatarUrl ?? undefined}
          avatarSize={56}
          gap={12}
          typographyVariant="h3"
        />

        <View>
          <Typography style={styles.textBlack} variant="h4">
            About
          </Typography>
          <Typography style={styles.bodyDescription} variant="paragraph2">
            {user.about}
          </Typography>
        </View>

        <View style={styles.bodyFeatures}>
          <Feature Icon={Calendar} iconVariant="Linear">
            Created {date}
          </Feature>

          {user.profile?.location ? (
            <Feature Icon={Location} iconVariant="Linear">
              {user.profile?.location?.locationName}
            </Feature>
          ) : null}
        </View>
      </View>

      {!teams.length ? null : (
        <>
          <Divider />

          <View>
            <Typography style={styles.bodySectionName} variant="h4">
              Teams
            </Typography>

            <View style={styles.bodyTeamsList}>
              {teams.map(team => (
                <EntityCard
                  key={team.id}
                  style={styles.teamCard}
                  contentStyle={styles.teamCardContent}
                  name={team.name}
                  avatarSize={40}
                  avatarType="square"
                  avatarUrl={team.imageUrl ?? undefined}
                  typographyVariant="h5"
                  isArrowVisible
                  onPress={() => handleTeamPress(team.id)}
                  AvatarBadge={getAvatarImageOrganizationBadge(team.organization)}
                />
              ))}
            </View>
          </View>

          <Divider />

          <View>
            <Typography style={styles.bodySectionName} variant="h4">
              Organizations
            </Typography>

            <View style={styles.bodyOrganizationsList}>
              {organizations.map(organization => (
                <TouchableOpacity
                  key={organization.id}
                  onPress={() => handleOrganizationPress(organization)}
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
        </>
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey100 },
  bodyContainer: {
    marginHorizontal: 24,
    marginTop: 32,
  },
  bodyContent: {
    marginTop: 32,
    paddingBottom: 100,
  },
  body: {
    gap: 32,
  },
  bodySectionName: {
    color: colors.black,
  },
  bodyDescription: {
    marginTop: 18,
    color: colors.grey500,
  },
  bodyFeatures: {
    gap: 16,
  },
  bodyTeamsList: {
    marginTop: 24,
    gap: 20,
  },
  bodyOrganizationsList: {
    marginTop: 24,
    gap: 8,
  },
  teamCardContent: {
    gap: 6,
  },
  textBlack: {
    color: colors.black,
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
});
