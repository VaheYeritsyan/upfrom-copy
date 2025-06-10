import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { MessageRepliesAvatarsProps, useTheme } from 'stream-chat-react-native';
import { AvatarImage } from '~Components/Avatar/AvatarImage';
import { getInitials } from '~utils/textFormat';

export const MessageRepliesAvatars: FC<MessageRepliesAvatarsProps> = ({ alignment, message }) => {
  const {
    theme: {
      colors: { white_snow },
      messageSimple: {
        replies: {
          avatar,
          avatarContainerMultiple,
          avatarContainerSingle,
          avatarSize,
          leftAvatarsContainer,
          rightAvatarsContainer,
        },
      },
    },
  } = useTheme();

  const avatars = message.thread_participants?.slice(-2) || [];
  const hasMoreThanOneReply = avatars.length > 1;

  return (
    <View
      style={[
        styles.avatarContainer,
        alignment === 'right' ? { marginLeft: 8, ...rightAvatarsContainer } : leftAvatarsContainer,
      ]}>
      {avatars.map((user, i) => (
        <View
          key={user.id}
          style={
            i === 1
              ? { ...styles.topAvatar, ...avatarContainerSingle }
              : {
                  paddingLeft: hasMoreThanOneReply ? 8 : 0,
                  ...avatarContainerMultiple,
                }
          }>
          <View
            style={[
              i === 1 && {
                borderColor: white_snow,
                borderWidth: 1,
              },
              avatar,
            ]}>
            <AvatarImage
              url={user.image}
              isDisabledEntity={!!user.deactivated_at}
              initials={getInitials(user.name!)}
              size={avatarSize ? avatarSize : i === 1 ? 18 : 16}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 2,
  },
  topAvatar: {
    paddingTop: 2,
    position: 'absolute',
  },
});
