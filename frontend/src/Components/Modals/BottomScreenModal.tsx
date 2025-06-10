import React, { PropsWithChildren, FC, useRef, useEffect, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
  Modal,
  InteractionManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { effects } from '~Theme/Effects';
import { colors } from '~Theme/Colors';

export type Props = PropsWithChildren & {
  style?: StyleProp<ViewStyle>;
  height?: number;
  isVisible: boolean;
  onClose: () => void;
};

const defaultValue = 600;

const animate = (target: Animated.Value, toValue: number, callback?: () => void) => {
  const timing = Animated.timing(target, { toValue, duration: 300, useNativeDriver: false });

  timing.start(callback);
};

export const BottomScreenModal: FC<Props> = ({ style, height = defaultValue, children, isVisible, onClose }) => {
  const valueY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const [isVisibleLocal, setIsVisibleLocal] = useState(false);

  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    if (isVisible) {
      InteractionManager.runAfterInteractions(() => {
        setIsVisibleLocal(true);
        animate(valueY, 0);
        animate(opacity, 1);
      });
    } else {
      animate(valueY, height);
      animate(opacity, 0, () => setIsVisibleLocal(false));
    }
  }, [isVisible, height]);

  return isVisibleLocal ? (
    <Modal animationType="fade" visible transparent>
      <Animated.View style={[styles.container, { opacity }]}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <Animated.View style={[styles.modalWrapper, { bottom: bottom || 12, transform: [{ translateY: valueY }] }]}>
          <View style={styles.modalContainer}>
            <View style={styles.grabber} />
            <View style={[styles.modalContent, style]}>{children}</View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  modalBackdrop: {
    backgroundColor: colors.blackTransparent20,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  modalWrapper: {
    left: 12,
    right: 12,
    position: 'absolute',
  },
  modalContainer: {
    borderRadius: 32,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grey200,
    paddingHorizontal: 24,
    paddingTop: 8.5,
    paddingBottom: 24,
    zIndex: 1,
    width: '100%',
    alignItems: 'center',
    ...effects.shadow1,
  },
  grabber: {
    width: 56,
    height: 5,
    borderRadius: 20,
    backgroundColor: colors.grey300,
  },
  modalContent: {
    marginTop: 32,
    width: '100%',
  },
});
