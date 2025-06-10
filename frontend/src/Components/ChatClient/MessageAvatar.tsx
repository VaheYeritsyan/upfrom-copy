import React, { FC } from 'react';
import { View } from 'react-native';
import { MessageAvatarProps, useTheme, useMessageContext } from 'stream-chat-react-native';
import { AvatarImage } from '~Components/Avatar/AvatarImage';
import { getInitials } from '~utils/textFormat';

export const MessageAvatar: FC<MessageAvatarProps> = ({ size }) => {
  const { alignment, lastGroupMessage, message, showAvatar } = useMessageContext();
  const {
    theme: {
      avatar: { BASE_AVATAR_SIZE },
      messageSimple: {
        avatarWrapper: { container, leftAlign, rightAlign, spacer },
      },
    },
  } = useTheme();

  const visible = typeof showAvatar === 'boolean' ? showAvatar : lastGroupMessage;

  return (
    <View style={[alignment === 'left' ? leftAlign : rightAlign, container]} testID="message-avatar">
      {visible ? (
        <AvatarImage
          url={message?.user?.image}
          isDisabledEntity={!!message.user?.deactivated_at}
          initials={getInitials((message?.user?.name || message?.user?.id) as string)}
          size={size || BASE_AVATAR_SIZE}
        />
      ) : (
        <View style={spacer} testID="spacer" />
      )}
    </View>
  );
};
