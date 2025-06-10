import React, { FC } from 'react';
import { StyleSheet, View, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { IconProps } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { effects } from '~Theme/Effects';
import { Typography } from '~Components/Typography';

export type ShortcutButtonProps = Omit<TouchableOpacityProps, 'children'> & {
  Icon: FC<IconProps>;
  iconVariant?: IconProps['variant'];
  iconColor?: IconProps['variant'];
  text: number | string;
  isHorizontal?: boolean;
  gradient?: 'blue' | 'purple';
  isBadgeVisible?: boolean;
  badgeColor?: string;
  counter?: number;
};

const gradientColors = {
  blue: [colors.primaryMainGradientStart, colors.primaryMainGradientEnd],
  purple: [colors.purpleGradientStart, colors.purpleGradientEnd],
};

export const ShortcutButton: FC<ShortcutButtonProps> = ({
  Icon,
  iconVariant = 'Bulk',
  iconColor = colors.primaryMain,
  text,
  gradient,
  counter,
  isHorizontal,
  isBadgeVisible,
  badgeColor = colors.yellow,
  activeOpacity = 0.6,
  ...props
}) => {
  const localIconColor = gradient ? colors.white : iconColor;
  const node = (
    <>
      <View style={[styles.cardContent, isHorizontal && styles.cardContentHorizontal]}>
        <View style={styles.cardIconContainer}>
          <Icon style={styles.cardIcon} size={24} variant={iconVariant} color={localIconColor} />
          {isBadgeVisible ? <View style={[styles.cardBadge, { backgroundColor: badgeColor }]} /> : null}
        </View>
        <Typography
          style={[styles.cardText, gradient && styles.cardTextGradient, isHorizontal && styles.cardTextHorizontal]}
          numberOfLines={1}
          variant="body1Bold">
          {text}
        </Typography>
      </View>

      {typeof counter !== 'undefined' ? (
        <View style={styles.cardCounter}>
          <Typography style={styles.cardCounterText} variant="body3Bold">
            {counter}
          </Typography>
        </View>
      ) : null}
    </>
  );

  const wrapperStyle = [styles.cardWrapper, isHorizontal && styles.cardWrapperHorizontal];

  return (
    <TouchableOpacity {...props} style={[styles.card, props.style]} activeOpacity={activeOpacity}>
      {gradient ? (
        <LinearGradient style={wrapperStyle} colors={gradientColors[gradient]} useAngle angle={135}>
          {node}
        </LinearGradient>
      ) : (
        <View style={wrapperStyle}>{node}</View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    ...effects.shadow1,
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 6,
    overflow: 'hidden',
  },
  cardWrapperHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardWrapper: {
    padding: 14,
    flex: 1,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  cardContent: {
    gap: 6,
    flex: 1,
  },
  cardContentHorizontal: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  cardBadge: {
    borderRadius: 4,
    width: 8,
    height: 8,
  },
  cardIconContainer: {
    width: 36,
    gap: 4,
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  cardIcon: {
    alignItems: 'center',
  },
  cardText: {
    color: colors.black,
  },
  cardTextGradient: {
    color: colors.white,
  },
  cardTextHorizontal: {
    flex: 1,
  },
  cardCounter: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 3,
    borderRadius: 12,
    borderColor: colors.white,
    backgroundColor: colors.orange,
  },
  cardCounterText: {
    color: colors.white,
  },
});
