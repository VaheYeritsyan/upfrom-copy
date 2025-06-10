import React, { Dispatch, FC, SetStateAction } from 'react';
import { Box } from '@mui/material';
import { ActionModalComponent } from '~/components/Modal/ActionModalComponent';
import styles from './location-modal.module.scss';
import { GooglePlacesAutocompleteInput } from '../Input/GooglePlacesAutocompleteInput';
import { GQLLocationType } from '~/types/googlePlaces';

type Props = {
  isOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  onOptionSelected: (location: GQLLocationType) => void;
};

export const LocationModal: FC<Props> = ({ isOpen, setModalOpen, onOptionSelected }) => {
  return (
    <ActionModalComponent
      className={styles.locationModal}
      bodyClassName={styles.locationModalBody}
      title="Location"
      isOpen={isOpen}
      onClose={() => {
        setModalOpen(false);
      }}>
      <Box className={styles.locationModalContent}>
        <GooglePlacesAutocompleteInput
          onSelectLocation={onOptionSelected}
          closeModal={() => {
            setModalOpen(false);
          }}
        />
      </Box>
    </ActionModalComponent>
  );
};
