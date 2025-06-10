import React, { FC, useState } from 'react';
import { Control, RegisterOptions } from 'react-hook-form';
import { MutationGenqlSelection } from '@up-from/graphql-ap/genql';
import { InputComponent } from '~/components/Input/InputComponent';
import { MaskInputComponent } from '../Input/MaskInputComponent';
import { DateInputComponent } from '../Input/DateInputComponent';
import { Box } from '@mui/material';
import { editUserValuesRules } from '~/util/validation';
import { AutocompleteInputComponent } from '../Input/AutocompleteInputComponent';
import styles from './editUserForm.module.scss';
import { GQLLocationType } from '~/types/googlePlaces';
import { LocationModal } from '../LocationModal/LocationModal';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type UserArgs = MutationGenqlSelection['updateUser']['__args'];

export type EditUserArgs = Pick<
  UserArgs,
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'location'
  | 'avatarUrl'
  | 'about'
  | 'id'
  | 'birthday'
  | 'gender'
  | 'type'
>;

type Props = {
  control: Control<EditUserArgs>;
  onSelectLocation: (location: GQLLocationType) => void;
};
enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
}
const userGenderOptions = Object.values(UserGender).map(value => ({ label: value, value }));

export const EditUserForm: FC<Props> = ({ control, onSelectLocation }) => {
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  return (
    <Box className={styles.inputContainer}>
      <InputComponent
        control={control}
        name="firstName"
        label="First Name"
        size="medium"
        variant="outlined"
        placeholder="First Name"
        rules={editUserValuesRules.firstName as RegisterOptions<EditUserArgs>}
        fullWidth
      />
      <InputComponent
        control={control}
        name="lastName"
        label="Last Name"
        size="medium"
        variant="outlined"
        placeholder="Last Name"
        rules={editUserValuesRules.lastName as RegisterOptions<EditUserArgs>}
        fullWidth
      />
      <DateInputComponent
        control={control}
        name="birthday"
        label="Birthday"
        size="small"
        variant="outlined"
        rules={editUserValuesRules.birthday as RegisterOptions<EditUserArgs>}
      />
      <LocationModal
        isOpen={locationModalVisible}
        setModalOpen={setLocationModalVisible}
        onOptionSelected={onSelectLocation}
      />
      <div
        className={styles.locationInputContainer}
        onClick={() => {
          setLocationModalVisible(true);
        }}>
        <InputComponent
          className={styles.locationInputContainer}
          control={control}
          name="location.locationName"
          label="Location"
          size="small"
          variant="outlined"
          placeholder="Location"
          isNotEditable
          rules={editUserValuesRules.location as RegisterOptions<EditUserArgs>}
        />
      </div>
      <AutocompleteInputComponent
        control={control}
        name="gender"
        label="Gender"
        size="small"
        variant="outlined"
        options={userGenderOptions}
        rules={editUserValuesRules.gender as RegisterOptions<EditUserArgs>}
      />
      <InputComponent
        control={control}
        name="email"
        label="Email"
        size="medium"
        variant="outlined"
        placeholder="Email"
        rules={editUserValuesRules.email as RegisterOptions<EditUserArgs>}
        fullWidth
      />
      <MaskInputComponent
        mask="+1 (999) 999-9999"
        control={control}
        name="phone"
        label="Phone"
        size="small"
        variant="outlined"
        type="text"
        placeholder="+1 (999) 999-9999"
        rules={editUserValuesRules.phone as RegisterOptions<EditUserArgs>}
        fullWidth
      />
      <InputComponent
        control={control}
        multiline
        name="about"
        label="About"
        size="medium"
        minRows={1}
        maxRows={6}
        variant="outlined"
        placeholder="About"
        rules={editUserValuesRules.about as RegisterOptions<EditUserArgs>}
        fullWidth
      />
    </Box>
  );
};
