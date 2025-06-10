import React from 'react';
import { Modal as ReactModal, StyleSheet, Pressable, View } from 'react-native';
import type { ReactNode, Dispatch, SetStateAction } from 'react';

import { effects } from '~Theme/Effects';

type ModalProps = {
  children: ReactNode;
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
};

export const Modal = ({ children, isVisible, setIsVisible }: ModalProps) => {
  return (
    <ReactModal animationType="fade" transparent={true} visible={isVisible}>
      <Pressable style={styles.modalBackdrop} onPress={() => setIsVisible(false)}>
        <View style={styles.modalContainer}>{children}</View>
      </Pressable>
    </ReactModal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...effects.shadow2,
  },
});
