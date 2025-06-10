import React, { FC } from 'react';
import { Message as StreamChatMessage, DefaultStreamChatGenerics, MessageProps } from 'stream-chat-react-native';
import { serializeMessageUser } from '~utils/chat';

export const Message: FC<MessageProps<DefaultStreamChatGenerics>> = ({ message, ...props }) => {
  return <StreamChatMessage {...props} message={{ ...message, user: serializeMessageUser(message.user) }} />;
};
