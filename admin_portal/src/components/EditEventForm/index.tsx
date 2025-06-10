import React, { FC, useState } from 'react';
import { Control, RegisterOptions } from 'react-hook-form';
import { MutationGenqlSelection } from '@up-from/graphql-ap/genql';
import { InputComponent } from '~/components/Input/InputComponent';
import { Box } from '@mui/material';
import { editEventValuesRules } from '~/util/validation';
import { DateTimeInputComponent } from '../Input/DateTimeInputComponent';
import styles from './editEventForm.module.scss';
import { LocationModal } from '../LocationModal/LocationModal';
import { GQLLocationType } from '~/types/googlePlaces';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type EventArgs = MutationGenqlSelection['updateEvent']['__args'];

export type EditEventArgs = Pick<
  EventArgs,
  | 'title'
  | 'description'
  | 'startsAt'
  | 'endsAt'
  | 'location'
  | 'address'
  | 'id'
  | 'imageUrl'
  | 'isCancelled'
  | 'isIndividual'
  | 'ownerId'
  | 'teamId'
>;

type Props = {
  control: Control<EditEventArgs>;
  onSelectLocation: (location: GQLLocationType) => void;
};

export const EditEventForm: FC<Props> = ({ control, onSelectLocation }) => {
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  return (
    <Box className={styles.inputContainer}>
      <LocationModal
        isOpen={locationModalVisible}
        setModalOpen={setLocationModalVisible}
        onOptionSelected={onSelectLocation}
      />
      <InputComponent
        control={control}
        name="title"
        label="Title"
        size="small"
        variant="outlined"
        type="text"
        placeholder="Title"
        rules={editEventValuesRules.title as RegisterOptions<EditEventArgs>}
      />
      <InputComponent
        control={control}
        name="description"
        label="Description"
        size="small"
        variant="outlined"
        multiline
        minRows={2}
        maxRows={4}
        placeholder="Description"
        rules={editEventValuesRules.description as RegisterOptions<EditEventArgs>}
      />
      <DateTimeInputComponent
        control={control}
        name="startsAt"
        label="Starts At"
        size="small"
        variant="outlined"
        rules={editEventValuesRules.startsAt as RegisterOptions<EditEventArgs>}
      />
      <DateTimeInputComponent
        control={control}
        name="endsAt"
        label="Ends At"
        size="small"
        variant="outlined"
        rules={editEventValuesRules.endsAt as RegisterOptions<EditEventArgs>}
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
          rules={editEventValuesRules.location as RegisterOptions<EditEventArgs>}
        />
      </div>

      <InputComponent
        control={control}
        multiline
        name="address"
        label="Address"
        size="small"
        minRows={2}
        maxRows={4}
        variant="outlined"
        placeholder="Address"
        rules={editEventValuesRules.address as RegisterOptions<EditEventArgs>}
      />
    </Box>
  );
};
