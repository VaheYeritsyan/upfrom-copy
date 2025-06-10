import React, { FC, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RegisterOptions, useForm } from 'react-hook-form';
// import { Event } from '@up-from/graphql/genql';
import { EventsStackParamList, Screens } from '~types/navigation';
import { HeaderBackButton, headerBackButtonContainerStyles } from '~Components/ScreenHeader/HeaderBackButton';
import { useCreateEventQueries } from '~Containers/Events/hooks/useCreateEventQueries';
import { KeyboardView } from '~Components/KeyboardView';
import { MainLayout } from '~Components/MainLayout';
import { ContainedButton } from '~Components/ContainedButton';
import { LargeTitleHeader } from '~Components/ScreenHeader/LargeTitleHeader';
import { Typography } from '~Components/Typography';
import { TextField } from '~Components/Field/TextField';
import { Divider } from '~Components/Divider';
import { colors } from '~Theme/Colors';
import { StackActions } from '@react-navigation/native';
import { eventFormSchema, EventFormValues } from '~Containers/Events/validations/eventValidation';
import { GQLLocationType } from '~types/location';
import { LocationModal } from '~Components/LocationModal';
import { TouchableOpacity as TouchableOpacityIOs } from 'react-native-gesture-handler';
import { TouchableOpacity as TouchableOpacityAndroid } from 'react-native';

type FormValues = Pick<
  EventFormValues,
  'address' | 'location.locationName' | 'location.locationID' | 'location.lat' | 'location.lng'
>;

type EventLocationProps = BottomTabScreenProps<EventsStackParamList, Screens.EVENT_LOCATION>;

export const EventLocation: FC<EventLocationProps> = ({ navigation, route }) => {
  const { imageData, isOwnerAttending, teamId, isIndividual, invitedIds, ...eventData } = route.params;
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const callback = (eventId: string) => {
    navigation.dispatch(StackActions.pop(3));
    navigation.navigate(Screens.EVENT_DETAILS, { eventId, withCalendarModal: isOwnerAttending || false });
  };
  const { isLoading, createEvent } = useCreateEventQueries(callback);

  const { control, handleSubmit, setValue, trigger, watch } = useForm<FormValues>();

  const LocationName = watch('location.locationName');

  useEffect(() => {
    if (LocationName) {
      trigger('location.locationName');
    }
  }, [LocationName]);

  const handleSelectLocation = (location: GQLLocationType) => {
    setValue('location.locationName', location.locationName as never);
    setValue('location.locationID', location.locationID as never);
    setValue('location.lat', location.lat as never);
    setValue('location.lng', location.lng as never);
  };

  const submit = async (values: FormValues) => {
    await createEvent({
      ...eventData,
      ...values,
      invitedIds,
      teamId,
      isIndividual,
      isOwnerAttending,
      blob: imageData?.blob,
    });
  };

  const stickyButton = (
    <ContainedButton
      text="Create Event"
      activeOpacity={0.8}
      color="blueGradient"
      disabled={isLoading}
      onPress={handleSubmit(submit)}
    />
  );

  return (
    <KeyboardView>
      <LocationModal
        modalVisible={locationModalVisible}
        setModalVisible={setLocationModalVisible}
        onOptionSelected={handleSelectLocation}
      />
      <MainLayout
        containerStyle={styles.container}
        style={styles.bodyContainer}
        headerContainerStyle={headerBackButtonContainerStyles}
        stickyBottomContainerStyle={styles.stickyBottomContainer}
        isHeaderBackgroundInvisible
        header={<HeaderBackButton />}
        stickyBottomContent={stickyButton}>
        <View>
          <LargeTitleHeader title="Where is it happening?" />

          <View style={styles.body}>
            <View style={styles.section}>
              <Typography variant="h4">Location Name</Typography>

              {Platform.OS === 'ios' ? (
                <TouchableOpacityIOs onPress={() => setLocationModalVisible(true)}>
                  <TextField
                    control={control}
                    radius="all"
                    label="Location"
                    name={'location.locationName'}
                    editable={false}
                    rules={eventFormSchema['location.locationName'] as RegisterOptions<FormValues, 'address'>}
                  />
                </TouchableOpacityIOs>
              ) : (
                <TouchableOpacityAndroid onPress={() => setLocationModalVisible(true)}>
                  <TextField
                    control={control}
                    radius="all"
                    label="Location"
                    name={'location.locationName'}
                    editable={false}
                    rules={eventFormSchema['location.locationName'] as RegisterOptions<FormValues, 'address'>}
                  />
                </TouchableOpacityAndroid>
              )}
            </View>

            <Divider />

            <View style={styles.section}>
              <Typography variant="h4">Address</Typography>

              <TextField
                control={control}
                name="address"
                radius="all"
                label="Address"
                isMultiline
                rules={eventFormSchema.address as RegisterOptions<FormValues, 'address'>}
              />
            </View>
          </View>
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
    marginTop: 32,
  },
  section: {
    gap: 18,
  },
  stickyBottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
