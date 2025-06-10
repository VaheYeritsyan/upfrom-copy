import React, { FC } from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { ArrowRight2, TickCircle } from 'iconsax-react-native';
import { AvatarType } from '~Components/Avatar/AvatarImage';
import { colors } from '~Theme/Colors';
import { effects } from '~Theme/Effects';
import { EntityInfo, Props as EntityInfoProps } from '~Components/EntityInfo';

export type Props = TouchableOpacityProps & {
  name: string;
  avatarUrl?: string;
  contentStyle?: EntityInfoProps['contentStyle'];
  avatarSource?: EntityInfoProps['avatarSource'];
  avatarInitialsColor?: EntityInfoProps['avatarInitialsColor'];
  endAdornment?: EntityInfoProps['endAdornment'];
  avatarBgColor?: EntityInfoProps['avatarBgColor'];
  isOnline?: boolean;
  avatarSize?: number;
  isDisabledEntity?: boolean;
  avatarType?: AvatarType;
  AvatarBadge?: EntityInfoProps['AvatarBadge'];
  typographyVariant?: EntityInfoProps['typographyVariant'];
  isArrowVisible?: boolean;
  isChecked?: boolean;
};

export const EntityCard: FC<Props> = ({
  name,
  contentStyle,
  avatarUrl,
  isOnline,
  avatarSize = 42,
  avatarSource,
  avatarInitialsColor,
  avatarBgColor,
  isChecked,
  AvatarBadge,
  isDisabledEntity,
  isArrowVisible,
  style,
  children,
  typographyVariant,
  avatarType = 'circle',
  activeOpacity = 0.6,
  endAdornment,
  ...props
}) => {
  const isCheckboxVisible = typeof isChecked !== 'undefined';

  return (
    <TouchableOpacity
      {...props}
      style={[styles.container, style]}
      disabled={props.disabled || !props.onPress || isDisabledEntity}
      activeOpacity={activeOpacity}>
      {isCheckboxVisible ? (
        <>
          {isChecked ? (
            <TickCircle
              color={colors.primaryMain}
              variant="Bold"
              size={20}
              style={[styles.checkbox, styles.checkboxChecked]}
            />
          ) : (
            <View style={[styles.checkbox, styles.checkboxEmpty]} />
          )}
        </>
      ) : null}

      <EntityInfo
        style={styles.content}
        contentStyle={[styles.content, contentStyle]}
        fullName={name}
        avatarUrl={avatarUrl}
        typographyVariant={typographyVariant}
        avatarSource={avatarSource}
        avatarInitialsColor={avatarInitialsColor}
        avatarBgColor={avatarBgColor}
        avatarSize={avatarSize}
        isOnline={isOnline}
        avatarType={avatarType}
        isDisabledEntity={isDisabledEntity}
        typographyColor={colors.black}
        AvatarBadge={AvatarBadge}
        endAdornment={endAdornment || (isArrowVisible ? <ArrowRight2 color={colors.grey400} size={18} /> : null)}>
        {children}
      </EntityInfo>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...effects.shadow1,
    padding: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 8,
    gap: 12,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    borderWidth: 2,
    borderRadius: 10,
  },
  checkboxEmpty: {
    borderColor: colors.grey200,
    width: 20,
    height: 20,
  },
  checkboxChecked: {
    borderColor: colors.primaryMain,
  },
  content: {
    flex: 1,
  },
});
