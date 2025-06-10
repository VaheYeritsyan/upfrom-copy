import React, { FC } from 'react';
import { StyleSheet } from 'react-native';
import { PreviewMessenger, Props as PreviewMessengerProps } from '~Components/ChatClient/PreviewMessenger';
import { colors } from '~Theme/Colors';
import { effects } from '~Theme/Effects';

export type Props = PreviewMessengerProps;

export const PreviewMessengerCard: FC<Props> = ({ style, ...props }) => {
  return <PreviewMessenger {...props} style={[style, styles.card]} />;
};

const styles = StyleSheet.create({
  card: {
    ...effects.shadow1,
    padding: 20,
    backgroundColor: colors.white,
    borderColor: colors.grey200,
    borderWidth: 0.5,
    borderRadius: 8,
  },
});
