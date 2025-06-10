import React from 'react';
import { Modal as ReactModal, StyleSheet, View } from 'react-native';
import type { ReactNode, Dispatch, SetStateAction } from 'react';

import { effects } from '~Theme/Effects';
import { colors } from '~Theme/Colors';

type ModalProps = {
  children: ReactNode;
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
};

export const FullScreenModal = ({ children, isVisible }: ModalProps) => {
  return (
    <ReactModal presentationStyle="pageSheet" animationType="slide" transparent={false} visible={isVisible}>
      <View style={styles.FullScreenModalContainer}>{children}</View>
    </ReactModal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...effects.shadow2,
  },
  FullScreenModalContainer: {
    backgroundColor: colors.grey100,
    alignItems: 'center',
    width: '100%',
    height: '100%',
    ...effects.shadow2,
  },
});
