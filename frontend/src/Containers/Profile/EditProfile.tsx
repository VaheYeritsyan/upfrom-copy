import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackActions } from '@react-navigation/native';

import { useEditProfileFrom } from '~Hooks/useEditProfileFrom';
import { MainLayout } from '~Components/MainLayout';
import { Typography } from '~Components/Typography';
import { ContainedButton } from '~Components/ContainedButton';
import { KeyboardView } from '~Components/KeyboardView';
import { ProfileForm } from '~Components/Profile/ProfileForm';
import { effects } from '~Theme/Effects';
import { colors } from '~Theme/Colors';
import { ProfileStackParamList, Screens } from '~types/navigation';

type ProfileSettingsProps = BottomTabScreenProps<ProfileStackParamList, Screens.EDIT_PROFILE>;

export function EditProfile({ navigation }: ProfileSettingsProps) {
  const submitCallback = () => navigation.dispatch(StackActions.pop(2));

  const { control, isSubmitDisabled, handleSubmit, handleSelectLocation } = useEditProfileFrom(
    'updateMyUser',
    submitCallback,
  );

  const header = (
    <TouchableOpacity style={styles.headerButton} onPress={navigation.goBack}>
      <Typography style={styles.headerButtonText} variant="body1SemiBold">
        Cancel
      </Typography>
    </TouchableOpacity>
  );

  const stickyButton = (
    <ContainedButton
      text="Done"
      activeOpacity={0.8}
      color="blueGradient"
      disabled={isSubmitDisabled}
      onPress={handleSubmit}
    />
  );

  return (
    <KeyboardView>
      <MainLayout
        containerStyle={styles.container}
        style={styles.bodyContainer}
        headerContainerStyle={styles.headerContainer}
        stickyBottomContainerStyle={styles.stickyBottomContainer}
        isHeaderBackgroundInvisible
        header={header}
        stickyBottomContent={stickyButton}>
        <Typography variant="h2">Edit Profile</Typography>

        <ProfileForm style={styles.body} control={control} onSelectLocation={handleSelectLocation} />
      </MainLayout>
    </KeyboardView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grey100,
    position: 'relative',
  },
  headerContainer: {
    flexDirection: 'row',
    height: 54,
  },
  headerButton: {
    ...effects.shadow1,
    borderRadius: 27,
    padding: 19,
    height: 54,
    backgroundColor: colors.white,
  },
  headerButtonText: {
    color: colors.grey500,
  },
  bodyContainer: {
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 200,
  },
  body: {
    marginTop: 46,
  },
  stickyBottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
