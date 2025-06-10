import React, { FC } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { IconProps } from 'iconsax-react-native';
import { Typography } from '~Components/Typography';
import { colors } from '~Theme/Colors';

type Props = {
  style?: ViewProps['style'];
  title: string;
  boldText?: string;
  text: string;
  Icon?: FC<IconProps>;
  iconVariant?: IconProps['variant'];
};

export const EventFormSectionHeader: FC<Props> = ({ style, title, boldText, iconVariant, text, Icon }) => (
  <View style={[styles.container, style]}>
    <View style={styles.content}>
      <Typography variant="h4">{title}</Typography>
      <Typography variant="body1Medium">
        <Typography style={styles.boldText} variant="body1Medium">
          {boldText}
        </Typography>
        &nbsp;
        <Typography style={styles.text} variant="body1Medium">
          {text}
        </Typography>
      </Typography>
    </View>

    {Icon ? (
      <View style={styles.iconContainer}>
        <Icon size={20} color={colors.grey600} variant={iconVariant} />
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    gap: 4,
    flex: 1,
  },
  boldText: {
    color: colors.grey600,
  },
  text: {
    color: colors.grey500,
  },
  iconContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: colors.grey200,
  },
});
