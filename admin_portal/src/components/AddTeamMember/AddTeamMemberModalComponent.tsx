import React, { FC, useRef, useState } from 'react';
import { Control, Controller, RegisterOptions } from 'react-hook-form';
import { Box, ButtonBase, Checkbox, Typography } from '@mui/material';
import { Team } from '@up-from/graphql-ap/genql';
import { ImageCropperShape } from '~/types/image';
import { userValuesRules, UserFormValues } from '~/util/validation';
import { filterTeamOptions } from '~/util/autocomplete';
import { ActionModalComponent } from '~/components/Modal/ActionModalComponent';
import { ImageEditorComponent } from '~/components/Image/ImageEditorComponent';
import { InputComponent } from '~/components/Input/InputComponent';
import { AutocompleteInputOptionComponent } from '~/components/Input/AutocompleteInputOptionComponent';
import { AutocompleteInputComponent, AutocompleteOption } from '~/components/Input/AutocompleteInputComponent';
import { MaskInputComponent } from '~/components/Input/MaskInputComponent';
import { DateInputComponent } from '~/components/Input/DateInputComponent';
import styles from './add-team-member-modal.module.scss';
import { LocationModal } from '../LocationModal/LocationModal';
import { GQLLocationType } from '~/types/googlePlaces';

export type CreateUserArgs = UserFormValues & {
  image?: Blob | null;
  team: Team | null;
  isSendSms?: boolean;
};

type Props = {
  control: Control<CreateUserArgs>;
  isOpen: boolean;
  onClose?: () => void;
  isLoading?: boolean;
  isTeamDisabled?: boolean;
  typeOptions: AutocompleteOption[];
  genderOptions: AutocompleteOption[];
  teams: Team[];
  isTeamsLoading?: boolean;
  onSubmit: () => void;
  onSelectLocation: (location: GQLLocationType) => void;
};

export const AddTeamMemberModalComponent: FC<Props> = ({
  control,
  isOpen,
  isLoading,
  isTeamsLoading,
  isTeamDisabled,
  teams,
  typeOptions,
  genderOptions,
  onClose,
  onSubmit,
  onSelectLocation,
}) => {
  const smsRef = useRef<HTMLInputElement>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const handleSendSmsToggle = () => {
    smsRef.current?.click();
  };

  return (
    <ActionModalComponent
      className={styles.createUserModal}
      bodyClassName={styles.createUserModalBody}
      title="Creating user"
      isOpen={isOpen}
      actionText="Create"
      isLoading={isLoading}
      onSubmit={onSubmit}
      onClose={onClose}>
      <Box className={styles.createUserModalFormGroup}>
        <Controller
          name="image"
          control={control}
          render={({ field }) => (
            <ImageEditorComponent
              shape={ImageCropperShape.CIRCLE}
              src={field.value}
              className={styles.createUserModalFormImage}
              onSave={field.onChange}
              onRemove={() => field.onChange(null)}
            />
          )}
        />

        <AutocompleteInputComponent
          control={control}
          name="role"
          label="Role"
          size="small"
          variant="outlined"
          options={typeOptions}
          rules={userValuesRules.role as RegisterOptions<CreateUserArgs>}
        />

        <AutocompleteInputComponent
          control={control}
          name="team"
          label="Team"
          size="small"
          disabled={isTeamDisabled}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          isLoading={isTeamsLoading}
          getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
          filterOptions={filterTeamOptions}
          variant="outlined"
          options={teams}
          rules={{ required: 'Required' }}
          renderOption={(props, team) => (
            <AutocompleteInputOptionComponent
              {...props}
              key={team.id}
              imgSrc={team.imageUrl}
              title={team.name}
              subtitle={team.id}
              isImgCircle={false}
            />
          )}
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
          rules={userValuesRules.phone as RegisterOptions<CreateUserArgs>}
        />
      </Box>

      <Controller
        name="isSendSms"
        control={control}
        render={({ field }) => (
          <ButtonBase className={styles.createUserModalFormCheckboxContainer} onClick={handleSendSmsToggle}>
            <Checkbox
              size="small"
              checked={field.value}
              inputRef={smsRef}
              onClick={e => e.stopPropagation()}
              onChange={field.onChange}
            />
            <Box>
              <Typography variant="subtitle2">SMS Invitation</Typography>
              <Typography lineHeight={1.2} color="textSecondary" variant="caption">
                Send SMS invitation instantly after the account creation.
              </Typography>
            </Box>
          </ButtonBase>
        )}
      />

      <Box className={styles.createUserModalDivider} />

      <Box className={styles.createUserModalFormGroup}>
        <InputComponent
          control={control}
          name="firstName"
          label="First Name"
          size="small"
          variant="outlined"
          type="text"
          placeholder="First Name"
          rules={userValuesRules.firstName as RegisterOptions<CreateUserArgs>}
        />

        <InputComponent
          control={control}
          name="lastName"
          label="Last Name"
          size="small"
          variant="outlined"
          placeholder="Last Name"
          rules={userValuesRules.lastName as RegisterOptions<CreateUserArgs>}
        />

        <InputComponent
          control={control}
          name="email"
          label="Email"
          size="small"
          type="text"
          variant="outlined"
          placeholder="Email"
          rules={userValuesRules.email as RegisterOptions<CreateUserArgs>}
        />

        <InputComponent
          control={control}
          name="about"
          label="About"
          size="small"
          variant="outlined"
          type="text"
          placeholder="About"
          multiline
          minRows={2}
          maxRows={4}
          rules={userValuesRules.about as RegisterOptions<CreateUserArgs>}
        />

        <LocationModal
          isOpen={locationModalVisible}
          setModalOpen={setLocationModalVisible}
          onOptionSelected={onSelectLocation}
        />
        <div
          onClick={() => {
            setLocationModalVisible(true);
          }}>
          <InputComponent
            control={control}
            name="location.locationName"
            label="Location"
            size="small"
            variant="outlined"
            placeholder="Location"
            isNotEditable
            rules={userValuesRules.location as RegisterOptions<CreateUserArgs>}
          />
        </div>

        <AutocompleteInputComponent
          control={control}
          name="gender"
          label="Gender"
          size="small"
          variant="outlined"
          options={genderOptions}
          rules={userValuesRules.gender as RegisterOptions<CreateUserArgs>}
        />

        <DateInputComponent
          control={control}
          name="birthday"
          label="Birthday"
          size="small"
          variant="outlined"
          rules={userValuesRules.birthday as RegisterOptions<CreateUserArgs>}
        />
      </Box>
    </ActionModalComponent>
  );
};
