import React, { FC, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useForm } from 'react-hook-form';
import { EventsStackParamList, Screens } from '~types/navigation';
import { removeEntityFields } from '~utils/entityFormat';
import { KeyboardView } from '~Components/KeyboardView';
import { MainLayout } from '~Components/MainLayout';
import { ContainedButton } from '~Components/ContainedButton';
import { LargeTitleHeader } from '~Components/ScreenHeader/LargeTitleHeader';
import { EventForm } from '~Components/Events/EventForm';
import { colors } from '~Theme/Colors';
import { ImagePickerData } from '~types/imagePicker';
import { setDate } from '~utils/dateFormat';
import { HeaderBackButton, headerBackButtonContainerStyles } from '~Components/ScreenHeader/HeaderBackButton';
import { EventFormValues } from '~Containers/Events/validations/eventValidation';

type CreateEventProps = BottomTabScreenProps<EventsStackParamList, Screens.CREATE_EVENT>;

export const CreateEvent: FC<CreateEventProps> = ({ navigation }) => {
  const [imageData, setImageData] = useState<ImagePickerData | null>(null);

  const { control, handleSubmit, trigger, watch } = useForm<EventFormValues>({
    mode: 'onChange',
  });
  const [startsAt, endsAt, date] = watch(['startsAt', 'endsAt', 'date']);

  useEffect(() => {
    if (date) {
      if (startsAt) {
        trigger(['startsAt', 'date']);
      }

      if (endsAt) {
        trigger(['endsAt', 'date']);
      }
    } else {
      if (startsAt && endsAt) {
        trigger(['startsAt', 'endsAt']);
      }
    }
  }, [startsAt, endsAt, date]);

  const submit = (values: EventFormValues) => {
    const formData = removeEntityFields(values, ['date', 'startsAt', 'endsAt']);
    const startsAt = setDate(values.startsAt, values.date);
    const endsAt = setDate(values.endsAt, values.date);

    navigation.navigate(Screens.EVENT_ASSIGNEES, { ...formData, startsAt, endsAt, imageData });
  };

  const handleSelectImage = (data: ImagePickerData) => {
    setImageData(data);
  };

  const handleRemoveImage = () => {
    setImageData(null);
  };

  const stickyButton = (
    <ContainedButton text="Continue" activeOpacity={0.8} color="blueGradient" onPress={handleSubmit(submit)} />
  );

  return (
    <KeyboardView>
      <MainLayout
        containerStyle={styles.container}
        style={styles.bodyContainer}
        headerContainerStyle={headerBackButtonContainerStyles}
        stickyBottomContainerStyle={styles.stickyBottomContainer}
        isHeaderBackgroundInvisible
        header={<HeaderBackButton text="Cancel" />}
        stickyBottomContent={stickyButton}>
        <LargeTitleHeader title="New Event" />

        <EventForm
          style={styles.form}
          control={control}
          imageUrl={imageData?.path}
          handleRemoveImage={handleRemoveImage}
          handleSelectImage={handleSelectImage}
        />
      </MainLayout>
    </KeyboardView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey100 },
  bodyContainer: {
    marginHorizontal: 24,
  },
  form: {
    marginTop: 32,
  },
  stickyBottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
