import React, { useState } from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { Control } from 'react-hook-form';
import { Masks } from 'react-native-mask-input';

import { TextField } from '~Components/Field/TextField';
import { DateTimePickerField } from '~Components/Field/DateTimePickerField';
import { SelectField } from '~Components/Field/SelectField';
import { Typography } from '~Components/Typography';
import { Divider } from '~Components/Divider';
import { AvatarEditor } from '~Components/Avatar/AvatarEditor';
import { colors } from '~Theme/Colors';
import { ProfileFormValues, profileFormSchema } from '~Containers/Profile/validations/profileValidation';
import { LocationModal } from '~Components/LocationModal';
import { GQLLocationType } from '~types/location';
import { TouchableOpacity as TouchableOpacityIOs } from 'react-native-gesture-handler';
import { TouchableOpacity as TouchableOpacityAndroid } from 'react-native';

type Props<FormValuesType extends ProfileFormValues = ProfileFormValues> = {
  style?: ViewProps['style'];
  control: Control<FormValuesType | ProfileFormValues>;
  onSelectLocation: (location: GQLLocationType) => void;
};

const footerMessages = [
  'If you wish to change your E-mail Address or Phone Number, please submit a New Ticket located in the Settings Tab',
  'At UpFrom we take people and children’s security very seriously, and an authorized assistant will guide you on your next Personal Details Verification Process.',
];

export const ProfileForm = <FormValuesType extends ProfileFormValues = ProfileFormValues>({
  style,
  control,
  onSelectLocation,
}: Props<FormValuesType>) => {
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  return (
    <View style={style}>
      <LocationModal
        modalVisible={locationModalVisible}
        setModalVisible={setLocationModalVisible}
        onOptionSelected={onSelectLocation}
      />
      <AvatarEditor control={control} />

      <Divider />

      <View>
        <TextField
          radius="top"
          control={control}
          name="firstName"
          label="First Name"
          rules={profileFormSchema.firstName}
        />
        <TextField
          control={control}
          name="lastName"
          radius="none"
          label="Last Name"
          rules={profileFormSchema.lastName}
        />
        <DateTimePickerField
          control={control}
          name="birthday"
          radius="none"
          label="Birthday"
          rules={profileFormSchema.birthday}
          mode="date"
        />
        <SelectField
          name="gender"
          label="Gender"
          control={control}
          radius="none"
          rules={profileFormSchema.gender}
          items={[
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ]}
        />
        {Platform.OS === 'ios' ? (
          <TouchableOpacityIOs onPress={() => setLocationModalVisible(true)}>
            <TextField
              control={control}
              radius="bottom"
              label="Location"
              name={'location.locationName'}
              editable={false}
              rules={profileFormSchema.location}
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
              rules={profileFormSchema.location}
            />
          </TouchableOpacityAndroid>
        )}
      </View>

      <View style={styles.aboutSection}>
        <TextField
          control={control}
          name="about"
          radius="all"
          label="About"
          isMultiline
          rules={profileFormSchema.about}
        />
      </View>

      <Divider />

      <View>
        <TextField
          control={control}
          radius="top"
          name="email"
          label="E-mail Address"
          isDisabled
          rules={profileFormSchema.email}
        />
        <TextField
          isDisabled
          control={control}
          radius="bottom"
          mask={Masks.USA_PHONE}
          name="phone"
          label="Phone Number"
          rules={profileFormSchema.phone}
        />
      </View>

      <View style={styles.footerMessages}>
        {footerMessages.map(message => (
          <Typography style={styles.footerMessage} variant="paragraph3" key={message}>
            {message}
          </Typography>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerMessages: {
    marginTop: 32,
    gap: 8,
  },
  aboutSection: {
    marginTop: 32,
  },
  footerMessage: {
    color: colors.grey400,
  },
});
