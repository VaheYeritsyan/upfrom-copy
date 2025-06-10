import React, { FC, PropsWithChildren, useMemo } from 'react';
import { StyleProp, StyleSheet, ViewStyle, View } from 'react-native';
import { colors } from '~Theme/Colors';
import { effects } from '~Theme/Effects';

export type Props = PropsWithChildren & {
  style?: StyleProp<ViewStyle>;
  size: number;
  color?: string;
  withShadow?: boolean;
};

export const Hexagon: FC<Props> = ({ style, size = 20, color = colors.black, withShadow, children }) => {
  const styles = useMemo(() => createStyles(size, color), [size, color]);

  return (
    <View style={[styles.hexagon, withShadow && effects.shadow3, style]}>
      <View>
        <View style={[styles.rectangle, styles.absolute, styles.before]} />
        <View style={styles.rectangle} />
        <View style={[styles.rectangle, styles.absolute, styles.after]} />
      </View>
      {children ? <View style={styles.absolute}>{children}</View> : null}
    </View>
  );
};

const magicNumber = 0.69;
const borderDivider = 8;

const createStyles = (size: number, color: string) =>
  StyleSheet.create({
    hexagon: {
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    rectangle: {
      width: size * 0.9 * magicNumber,
      height: size * 0.9,
      borderRadius: size / borderDivider,
      backgroundColor: color,
    },
    absolute: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    before: {
      transform: [{ rotate: '60deg' }],
    },
    after: {
      transform: [{ rotate: '-60deg' }],
    },
  });
