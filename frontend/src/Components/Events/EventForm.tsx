import React, { PropsWithChildren, useState } from 'react';
import { StyleSheet, View, ViewProps, Platform } from 'react-native';
import { Control } from 'react-hook-form';
import { Divider } from '~Components/Divider';
import { TextField } from '~Components/Field/TextField';
import { DateTimePickerField } from '~Components/Field/DateTimePickerField';
import { Typography } from '~Components/Typography';
import { ImagePicker, Props as ImagePickerProps } from '~Components/Image/ImagePicker';
import { colors } from '~Theme/Colors';
import { Image } from '~Components/Image/Image';
import { EventFormValues, eventFormSchema } from '~Containers/Events/validations/eventValidation';
import { LocationModal } from '~Components/LocationModal';
import { GQLLocationType } from '~types/location';
import { TouchableOpacity as TouchableOpacityIOs } from 'react-native-gesture-handler';
import { TouchableOpacity as TouchableOpacityAndroid } from 'react-native';

type Props<FormValuesType extends EventFormValues = EventFormValues> = PropsWithChildren & {
  style?: ViewProps['style'];
  control: Control<FormValuesType | EventFormValues>;
  isEditing?: boolean;
  isUploadLoading?: boolean;
  imageUrl?: string | null;
  handleRemoveImage: ImagePickerProps['onRemove'];
  handleSelectImage: ImagePickerProps['onSelect'];
  onSelectLocation?: (location: GQLLocationType) => void;
};

const minimumDate = new Date();

export const EventForm = <FormValuesType extends EventFormValues = EventFormValues>({
  style,
  control,
  isEditing,
  imageUrl,
  isUploadLoading,
  handleRemoveImage,
  handleSelectImage,
  children,
  onSelectLocation,
}: Props<FormValuesType>) => {
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  return (
    <View style={style}>
      {onSelectLocation && (
        <LocationModal
          modalVisible={locationModalVisible}
          setModalVisible={setLocationModalVisible}
          onOptionSelected={onSelectLocation}
        />
      )}

      <View style={styles.section}>
        <Typography variant="h4">Details</Typography>

        <TextField control={control} name="title" radius="all" label="Title" rules={eventFormSchema.title} />

        <TextField
          control={control}
          name="description"
          radius="all"
          label="Description"
          isMultiline
          rules={eventFormSchema.description}
        />
      </View>

      <Divider />

      <View style={styles.section}>
        <Typography variant="h4">Date & Time</Typography>

        <View>
          <DateTimePickerField
            control={control}
            name="date"
            radius="top"
            label="Date"
            minimumDate={minimumDate}
            rules={eventFormSchema.date}
            mode="date"
          />
          <DateTimePickerField
            control={control}
            name="startsAt"
            radius="none"
            label="Starts at"
            rules={eventFormSchema.startsAt}
            mode="time"
          />
          <DateTimePickerField
            control={control}
            name="endsAt"
            radius="bottom"
            label="Ends at"
            rules={eventFormSchema.endsAt}
            mode="time"
          />
        </View>
      </View>

      {isEditing ? (
        <>
          <Divider />

          <View style={styles.section}>
            <Typography variant="h4">Location</Typography>

            <View>
              {Platform.OS === 'ios' ? (
                <TouchableOpacityIOs onPress={() => setLocationModalVisible(true)}>
                  <TextField
                    control={control}
                    radius="bottom"
                    label="Location"
                    name={'location.locationName'}
                    editable={false}
                    rules={eventFormSchema['location.locationName']}
                  />
                </TouchableOpacityIOs>
              ) : (
                <TouchableOpacityAndroid onPress={() => setLocationModalVisible(true)}>
                  <TextField
                    control={control}
                    radius="bottom"
                    label="Location"
                    name={'location.locationName'}
                    editable={false}
                    rules={eventFormSchema['location.locationName']}
                  />
                </TouchableOpacityAndroid>
              )}

              <TextField
                control={control}
                name="address"
                radius="bottom"
                label="Address"
                isMultiline
                rules={eventFormSchema.address}
              />
            </View>
          </View>
        </>
      ) : null}

      <Divider />

      <ImagePicker
        title="Cover Photo"
        isUploaded={!!imageUrl}
        isLoading={isUploadLoading}
        onRemove={handleRemoveImage}
        onSelect={handleSelectImage}>
        {imageUrl ? (
          <Image style={styles.imagePickerPlaceholder} url={imageUrl} />
        ) : (
          <View style={[styles.imagePickerPlaceholder, styles.imagePickerPlaceholderBordered]}>
            <Typography style={styles.imagePickerPlaceholderText} variant="h5" align="center">
              Select a cover photo.
            </Typography>
          </View>
        )}
      </ImagePicker>

      {children ? (
        <>
          <Divider />

          <View style={styles.members}>{children}</View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 18,
  },
  imagePickerPlaceholder: {
    flex: 1,
    height: 200,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  imagePickerPlaceholderBordered: {
    backgroundColor: colors.grey200,
    borderWidth: 1,
    borderColor: colors.grey300,
  },
  imagePickerPlaceholderText: {
    color: colors.grey400,
  },
  members: {
    gap: 18,
  },
});
