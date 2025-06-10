import React, { FC, useState } from 'react';
import { Control, RegisterOptions } from 'react-hook-form';
import { InputComponent } from '~/components/Input/InputComponent';
import { eventValuesRules, EventFormValues } from '~/util/validation';
import { LocationModal } from '../LocationModal/LocationModal';
import { GQLLocationType } from '~/types/googlePlaces';

export type LocationFormArgs = Pick<EventFormValues, 'location' | 'address'>;

type Props = {
  control: Control<LocationFormArgs>;
  onSelectLocation: (location: GQLLocationType) => void;
};

export const CreateEventLocationFormComponent: FC<Props> = ({ control, onSelectLocation }) => {
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  return (
    <>
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
          rules={eventValuesRules.location as RegisterOptions<LocationFormArgs>}
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
        rules={eventValuesRules.address as RegisterOptions<LocationFormArgs>}
      />
    </>
  );
};
