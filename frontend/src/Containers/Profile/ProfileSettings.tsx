import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '~Theme/Colors';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ProfileCircle, NotificationStatus, DocumentText, SecurityUser, SmsTracking } from 'iconsax-react-native';

import { ProfileStackParamList, Screens } from '~types/navigation';
import { Header } from '~Components/ScreenHeader/Header';
import { Typography } from '~Components/Typography';
import { MainLayout } from '~Components/MainLayout';
import { Divider } from '~Components/Divider';
import { useAuthContext } from '~Hooks/useAuthContext';
import { EntityInfo } from '~Components/EntityInfo';
import { Button } from '~Components/Button';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { SmallButton } from '~Components/SmallButton';
import { ActionMenuItem } from '~Components/Profile/ActionMenuItem';
import { effects } from '~Theme/Effects';
import { openFeedbackInWeb, openPrivacyPolicyInWeb, openTermsAndConditionsInWeb } from '~utils/links';
import { useDeviceApi } from '~Hooks/useDeviceApi';

type ProfileSettingsProps = BottomTabScreenProps<ProfileStackParamList, Screens.PROFILE_SETTINGS>;

export function ProfileSettings({ navigation }: ProfileSettingsProps) {
  const { signOut } = useAuthContext();
  const { currentUser } = useCurrentUserContext();
  const deviceApi = useDeviceApi();

  const fullName = `${currentUser?.firstName} ${currentUser?.lastName}`;

  const handleEditProfilePress = () => {
    navigation.navigate(Screens.EDIT_PROFILE);
  };

  const handleNotificationsPress = () => {
    navigation.navigate(Screens.NOTIFICATIONS_SETTINGS);
  };

  const handleLogOutPress = async () => {
    await deviceApi.removeDevice();
    await signOut();
  };

  const endAdornmentElement = (
    <SmallButton text="Done" state="active" activeOpacity={0.6} onPress={navigation.goBack} />
  );

  return (
    <MainLayout
      containerStyle={styles.container}
      style={styles.bodyContainer}
      header={
        <Header isBackArrowInvisible endAdornment={endAdornmentElement}>
          <EntityInfo
            fullName={fullName}
            avatarSize={26}
            gap={8}
            avatarUrl={currentUser?.avatarUrl ?? undefined}
            typographyVariant="body1SemiBold"
          />
        </Header>
      }>
      <View style={styles.body}>
        <Typography style={styles.textBlack} variant="h4">
          Settings
        </Typography>

        <View>
          <ActionMenuItem Icon={ProfileCircle} onPress={handleEditProfilePress}>
            Edit Profile
          </ActionMenuItem>
          <ActionMenuItem Icon={NotificationStatus} onPress={handleNotificationsPress}>
            Notifications Preferences
          </ActionMenuItem>
        </View>

        <View style={styles.bodyMoreSection}>
          <Typography style={styles.textBlack} variant="body1SemiBold">
            More
          </Typography>

          <View>
            <ActionMenuItem Icon={DocumentText} onPress={openTermsAndConditionsInWeb}>
              Terms & Conditions
            </ActionMenuItem>
            <ActionMenuItem Icon={SecurityUser} onPress={openPrivacyPolicyInWeb}>
              Privacy Policy
            </ActionMenuItem>
            <ActionMenuItem Icon={SmsTracking} onPress={openFeedbackInWeb}>
              Share Your Feedback
            </ActionMenuItem>
          </View>
        </View>
      </View>

      <Divider />

      <Button
        text="Log Out"
        shape="rectangle"
        size="large"
        color="black"
        activeOpacity={0.8}
        fullWidth
        onPress={handleLogOutPress}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grey100,
  },
  bodyContainer: {
    marginHorizontal: 24,
    marginTop: 32,
  },
  body: {
    gap: 32,
  },
  bodyMoreSection: {
    gap: 12,
  },
  bodyAboutSection: {
    gap: 18,
  },
  textBlack: {
    color: colors.black,
  },
  websiteButton: {
    ...effects.shadow1,
    borderWidth: 0.5,
    borderRadius: 6,
    borderColor: colors.grey200,
    backgroundColor: colors.white,
    gap: 10,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
