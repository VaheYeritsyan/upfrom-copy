import React, { FC } from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft2 } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { effects } from '~Theme/Effects';
import { Typography } from '~Components/Typography';

type Props = TouchableOpacityProps & {
  text?: string;
};

export const HeaderBackButton: FC<Props> = ({ style, text, onPress, ...props }) => {
  const { goBack } = useNavigation();

  return (
    <TouchableOpacity {...props} style={[styles.headerButton, style]} onPress={onPress || goBack}>
      {text ? (
        <Typography style={styles.headerButtonText} variant="body1SemiBold">
          {text}
        </Typography>
      ) : (
        <ArrowLeft2 size={18} color={colors.grey500} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    height: 54,
  },
  headerButton: {
    ...effects.shadow1,
    borderRadius: 27,
    padding: 19,
    height: 54,
    backgroundColor: colors.white,
  },
  headerButtonText: {
    color: colors.grey500,
  },
});

export const headerBackButtonContainerStyles = styles.headerContainer;
