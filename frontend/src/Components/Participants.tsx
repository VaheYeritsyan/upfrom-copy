import React, { FC } from 'react';
import { User } from '@up-from/graphql/genql';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ChannelMemberResponse } from 'stream-chat';
import type { Variant } from '~Theme/Typography';
import { AvatarImage, AvatarType } from '~Components/Avatar/AvatarImage';
import { Typography } from '~Components/Typography';
import { getInitials } from '~utils/textFormat';
import { colors } from '~Theme/Colors';

const visibleAvatarsNumber = 3;

export type Props = {
  participants: (ChannelMemberResponse & {
    user?: Pick<ChannelMemberResponse, 'user'> & Partial<Pick<User, 'isDisabled'>>;
  })[];
  avatarSize?: number;
  avatarType?: AvatarType;
  typographyVariant?: Variant;
  text?: string;
  textColor?: string;
  onContainerPress?: () => void;
};

export const Participants: FC<Props> = ({
  onContainerPress,
  avatarSize = 26,
  avatarType = 'circle',
  typographyVariant = 'body1Bold',
  participants,
  text,
  textColor,
}) => {
  const participantsNames = participants.map(option => {
    return option.user?.deactivated_at || option.user?.isDisabled ? 'Disabled User' : option.user?.name;
  });
  const fullName = participantsNames.join(', ');
  const avatarContainerStyle = { width: avatarSize, height: avatarSize };

  const childrenNodes = (
    <>
      {participants.slice(0, visibleAvatarsNumber).map(item => {
        return (
          <View key={item.user?.id} style={[styles.itemAvatarContainer, avatarContainerStyle]}>
            <AvatarImage
              size={avatarSize - 4}
              initials={getInitials(item.user?.name!)}
              isDisabledEntity={!!item.user?.deactivated_at || item.user?.isDisabled}
              // @ts-ignore
              url={item.user?.image}
              type={avatarType}
              key={item.user?.id}
            />
          </View>
        );
      })}
      {participants.length > visibleAvatarsNumber && (
        <View style={[styles.itemAvatarContainer, avatarContainerStyle]}>
          <AvatarImage
            size={avatarSize - 4}
            initials={'+' + (participants.length - visibleAvatarsNumber).toString()}
            type={avatarType}
          />
        </View>
      )}
      <Typography
        style={{ ...styles.names, color: textColor ?? colors.black }}
        numberOfLines={1}
        variant={typographyVariant}>
        {text ? text : fullName}
      </Typography>
    </>
  );

  return onContainerPress ? (
    <TouchableOpacity style={styles.itemContainer} onPress={onContainerPress}>
      {childrenNodes}
    </TouchableOpacity>
  ) : (
    <View style={styles.itemContainer}>{childrenNodes}</View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginLeft: 5,
  },
  itemAvatarContainer: {
    marginLeft: -10,
    position: 'relative',
    backgroundColor: colors.white,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  names: { marginLeft: 8, overflow: 'hidden', flex: 1 },
});
