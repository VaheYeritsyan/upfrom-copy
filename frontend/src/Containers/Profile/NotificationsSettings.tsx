import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useForm } from 'react-hook-form';
import { MainLayout } from '~Components/MainLayout';
import { Typography } from '~Components/Typography';
import { ContainedButton } from '~Components/ContainedButton';
import { KeyboardView } from '~Components/KeyboardView';
import { effects } from '~Theme/Effects';
import { colors } from '~Theme/Colors';
import { ProfileStackParamList, Screens } from '~types/navigation';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { Selector } from '~Components/Selector';
import { Divider } from '~Components/Divider';
import {
  useNotificationPreferencesQueries,
  UpdateNotificationsPreferencesArgs,
} from '~Containers/Profile/hooks/useNotificationPreferencesQueries';
import { ControlledSwitcherWithText } from '~Components/Switcher/ControlledSwitcherWithText';

type NotificationsSettingsProps = BottomTabScreenProps<ProfileStackParamList, Screens.NOTIFICATIONS_SETTINGS>;
type FormValues = UpdateNotificationsPreferencesArgs;
type ListContent = {
  title: string;
  subtitle: string;
};

enum Options {
  CUSTOM = 'Custom',
  DISABLE_ALL = 'Disable All',
  ENABLE_ALL = 'Enable All',
}
const options = Object.values(Options);

const pushList: Record<keyof UpdateNotificationsPreferencesArgs, ListContent> = {
  pushChatNewMessage: {
    title: 'New Message',
    subtitle: 'Receive instant alerts for incoming messages from mentors and fellow users.',
  },
  pushTeamNewMember: {
    title: 'New Team Members',
    subtitle: 'Get notified when a new member joins a team you are part of.',
  },
  pushEventNewInvitation: {
    title: 'New Event Invitation',
    subtitle: "Get notified when you're invited to join exciting mentoring events.",
  },
  pushEventNewAllTeam: {
    title: 'New All Teams Event',
    subtitle: 'Stay updated on public UpFrom events available for all teams and users to attend.',
  },
  pushEventUpdatedDateTime: {
    title: 'Event Date/Time Changed',
    subtitle: "Be informed if there are updates to the schedule of events you've registered for.",
  },
  pushEventUpdatedLocation: {
    title: 'Event Location Changed',
    subtitle: 'Receive notifications about any changes to the venue for upcoming events.',
  },
  pushEventCancelled: { title: 'Event Cancelled', subtitle: 'Get notified in case any scheduled event is canceled.' },
  pushEventRemovedIndividual: {
    title: 'Removed from Event',
    subtitle: "Stay informed if you’ve been removed from an event you're participating in.",
  },
  emailChatNewMessage: {
    title: '',
    subtitle: '',
  },
  emailEventPendingInvitation: {
    title: '',
    subtitle: '',
  },
};

const emailList: Record<keyof UpdateNotificationsPreferencesArgs, ListContent> = {
  emailChatNewMessage: {
    title: 'New Message',
    subtitle: 'Receive instant alerts for incoming messages from mentors and fellow users.',
  },
  emailEventPendingInvitation: {
    title: 'Pending Event Invitation',
    subtitle: 'Be alerted about a pending event invitation in your inbox.',
  },
  pushChatNewMessage: {
    title: '',
    subtitle: '',
  },
  pushEventCancelled: {
    title: '',
    subtitle: '',
  },
  pushEventNewAllTeam: {
    title: '',
    subtitle: '',
  },
  pushEventNewInvitation: {
    title: '',
    subtitle: '',
  },
  pushEventRemovedIndividual: {
    title: '',
    subtitle: '',
  },
  pushEventUpdatedDateTime: {
    title: '',
    subtitle: '',
  },
  pushEventUpdatedLocation: {
    title: '',
    subtitle: '',
  },
  pushTeamNewMember: {
    title: '',
    subtitle: '',
  },
};

const pushListEntries = Object.entries(pushList);
const emailListEntries = Object.entries(emailList);
const listEntries = [...emailListEntries, ...pushListEntries];

const getOption = (values?: FormValues) => {
  const booleanValues = Object.values(values) as boolean[];

  const enabled = booleanValues.every(value => value);
  if (enabled) return Options.ENABLE_ALL;

  const custom = booleanValues.some(value => value);
  if (custom) return Options.CUSTOM;

  return Options.DISABLE_ALL;
};

export function NotificationsSettings({ navigation }: NotificationsSettingsProps) {
  const { currentUser } = useCurrentUserContext();
  const [selectedOption, setSelectedOption] = useState(Options.ENABLE_ALL);

  const { isLoading, update } = useNotificationPreferencesQueries();

  const { control, getValues, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: currentUser?.notificationPreferences,
    values: currentUser?.notificationPreferences,
  });

  useEffect(() => {
    if (!currentUser?.notificationPreferences) return;

    setSelectedOption(getOption(currentUser.notificationPreferences));
  }, [currentUser?.notificationPreferences]);

  const handleChange = () => {
    const values = getValues();

    setSelectedOption(getOption(values));
  };

  const handleSelectOption = (option: Options) => {
    setSelectedOption(option);

    if (option === Options.CUSTOM) return;
    for (const [name] of listEntries) {
      setValue(name as keyof FormValues, option === Options.ENABLE_ALL);
    }
  };

  const submit = async (values: FormValues) => {
    await update(values);
    navigation.goBack();
  };

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
      disabled={isLoading}
      onPress={handleSubmit(submit)}
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
        <Typography variant="h2">Notifications Preferences</Typography>

        <View style={styles.managementCard}>
          <View style={styles.managementCardHeader}>
            <Typography variant="body1SemiBold">Toggle All Alerts</Typography>
            <Typography style={styles.managementCardSubtitle} variant="body1Medium">
              Use the controls to easily enable or disable all notifications at once.
            </Typography>
          </View>

          <Selector options={options} selectedOption={selectedOption} onOptionSelected={handleSelectOption} />
        </View>

        <Divider />

        <View style={styles.lists}>
          <View>
            <Typography variant="h4">Push Notifications</Typography>
            <View style={styles.list}>
              {pushListEntries.map(([name, { title, subtitle }]) => (
                <ControlledSwitcherWithText
                  key={name}
                  style={styles.listItem}
                  control={control}
                  name={name as keyof FormValues}
                  title={title}
                  subtitle={subtitle}
                  onChange={handleChange}
                />
              ))}
            </View>
          </View>

          <View>
            <Typography variant="h4">Email Notifications</Typography>
            <View style={styles.list}>
              {emailListEntries.map(([name, { title, subtitle }]) => (
                <ControlledSwitcherWithText
                  key={name}
                  style={styles.listItem}
                  control={control}
                  name={name as keyof FormValues}
                  title={title}
                  subtitle={subtitle}
                  onChange={handleChange}
                />
              ))}
            </View>
          </View>
        </View>
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
  managementCard: {
    ...effects.shadow1,
    marginTop: 32,
    borderWidth: 0.5,
    borderColor: colors.grey200,
    backgroundColor: colors.white,
    gap: 20,
    padding: 20,
    borderRadius: 8,
  },
  managementCardHeader: {
    gap: 4,
  },
  managementCardSubtitle: {
    color: colors.grey500,
  },
  lists: {
    gap: 32,
  },
  list: {
    marginTop: 18,
  },
  listItem: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey200,
  },
  stickyBottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
