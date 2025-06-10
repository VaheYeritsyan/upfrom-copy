import React, { FC, PropsWithChildren, ReactNode, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import type { Variant } from '~Theme/Typography';
import { AvatarImage, AvatarType, AvatarProps } from '~Components/Avatar/AvatarImage';
import { Typography } from '~Components/Typography';
import { getInitials } from '~utils/textFormat';
import { colors } from '~Theme/Colors';

export type Props = PropsWithChildren & {
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  fullName: string;
  avatarUrl?: string;
  avatarSource?: AvatarProps['source'];
  avatarInitialsColor?: AvatarProps['initialsColor'];
  avatarBgColor?: AvatarProps['backgroundColor'];
  AvatarBadge?: AvatarProps['Badge'];
  isOnline?: boolean;
  avatarSize?: number;
  isDisabledEntity?: boolean;
  badge?: ReactNode;
  avatarType?: AvatarType;
  typographyVariant?: Variant;
  typographyColor?: string;
  gap?: number;
  endAdornment?: ReactNode;
};

export const EntityInfo: FC<Props> = ({
  style,
  contentStyle,
  fullName,
  avatarUrl,
  avatarSource,
  avatarInitialsColor,
  avatarBgColor,
  badge,
  AvatarBadge,
  isDisabledEntity,
  isOnline,
  avatarSize = 42,
  avatarType = 'circle',
  typographyColor = colors.black,
  typographyVariant = 'body1Bold',
  gap = 12,
  endAdornment,
  children,
}) => {
  const localFullName = isDisabledEntity ? 'Disabled User' : fullName;
  const initials = useMemo(() => getInitials(localFullName), [localFullName]);

  return (
    <View style={[styles.itemContainer, { gap }, style]}>
      <View style={styles.itemAvatarContainer}>
        <AvatarImage
          size={avatarSize}
          source={avatarSource}
          isDisabledEntity={isDisabledEntity}
          initialsColor={avatarInitialsColor}
          backgroundColor={avatarBgColor}
          initials={initials}
          url={avatarUrl}
          type={avatarType}
          Badge={AvatarBadge}
        />
        {isOnline ? (
          <View style={styles.itemOnlineIndicatorContainer}>
            <View style={styles.itemOnlineIndicator} />
          </View>
        ) : null}
      </View>
      <View style={[styles.itemContent, contentStyle]}>
        <View style={[styles.itemContentTop, { flex: children ? 0 : 1 }]}>
          <Typography
            style={[styles.itemContentTitle, { color: typographyColor }]}
            numberOfLines={1}
            variant={typographyVariant}>
            {localFullName}
          </Typography>
          {badge}
        </View>
        {children}
      </View>
      {endAdornment}
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
  },
  itemAvatarContainer: {
    position: 'relative',
  },
  itemOnlineIndicatorContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  itemOnlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  itemContent: {
    justifyContent: 'flex-start',
    gap: 4,
    flex: 1,
  },
  itemContentTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    flex: 1,
    overflow: 'hidden',
  },
  itemContentTitle: {
    flexShrink: 1,
  },
});
