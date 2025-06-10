import React, { Dispatch, SetStateAction } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { FullScreenModal } from '~Components/Modals/FullScreenModal';
import { LargeTitleHeader } from '~Components/ScreenHeader/LargeTitleHeader';
import { MainLayout } from '~Components/MainLayout';
import { KeyboardView } from '~Components/KeyboardView';
import { HeaderBackButton, headerBackButtonContainerStyles } from '~Components/ScreenHeader/HeaderBackButton';
import { GooglePlacesInput } from './GooglePlacesInput';
import { GQLLocationType } from '~types/location';

type LocationModalProps = {
  modalVisible: boolean;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  onOptionSelected: (location: GQLLocationType) => void;
};

export function LocationModal({ modalVisible, setModalVisible, onOptionSelected }: LocationModalProps) {
  const handleBackPress = () => {
    setModalVisible(false);
  };

  return (
    <FullScreenModal isVisible={modalVisible} setIsVisible={setModalVisible}>
      <KeyboardView>
        <MainLayout
          style={styles.modalContainer}
          headerContainerStyle={headerBackButtonContainerStyles}
          header={<HeaderBackButton text={'Cancel'} onPress={handleBackPress} />}
          stickyBottomContent={null}>
          <LargeTitleHeader style={styles.modalHeader} title="Set your location" />
          <GooglePlacesInput onSelectLocation={onOptionSelected} closeModal={() => setModalVisible(false)} />
        </MainLayout>
      </KeyboardView>
    </FullScreenModal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    display: 'flex',
    backgroundColor: 'transparent',
    paddingTop: 100,
    width: Dimensions.get('window').width,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  modalHeader: {
    marginBottom: 20,
  },
});
