import { useCallback } from 'react';
import { ChannelMemberResponse, DefaultGenerics } from 'stream-chat';
import { generateRandomId } from 'stream-chat-react-native';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { DefaultStreamChatGenerics } from 'stream-chat-react-native';
import { useChatContext } from '~Context/ChatContext';

export const useChatClient = () => {
  const { currentUser } = useCurrentUserContext();
  const { chatClient } = useChatContext();

  const teamIds = currentUser?.teams?.map(({ id }) => id) || [];

  const getTeamUsers = useCallback(async () => {
    if (currentUser && chatClient !== null) {
      const filter = { id: { $in: teamIds } };
      const response = await chatClient.queryChannels(filter);
      if (response.length) {
        const allMembers = response.map(channel => channel.state.members).flat();

        return allMembers.reduce(
          (acc, curr) => ({
            ...acc,
            ...curr,
          }),
          {},
        );
      }
      return undefined;
    }
  }, [chatClient, currentUser]);

  const getTeamChannel = useCallback(
    async (id: string) => {
      if (currentUser && chatClient !== null) {
        // chatClient.getChannelById doesn't work
        // (moreover this method is not even documented)
        const response = await chatClient.queryChannels({ type: 'team', id });
        return response[0] || undefined;
      }
    },
    [chatClient, currentUser],
  );

  const createDirectMessageChannel = useCallback(
    async (userIds: string[], name?: string, teamId?: string) => {
      if (chatClient !== null) {
        const members = [...userIds, currentUser?.id ?? ''];
        const channelId = name ? `${currentUser?.id}-${generateRandomId()}` : undefined;

        const channel = chatClient.channel('messaging', channelId, {
          name,
          members,
          teamId,
        });

        await channel.create();
        return channel;
      }
    },
    [chatClient, currentUser?.id],
  );

  const filterTeamParticipants = useCallback(
    (participants: Record<string, ChannelMemberResponse<DefaultStreamChatGenerics>>) => {
      const participantsArray: ChannelMemberResponse<DefaultGenerics>[] = Object.values(participants);
      const participantsArrayFiltered = participantsArray.filter(item => {
        return item.user_id !== currentUser?.id;
      });
      return participantsArrayFiltered;
    },
    [currentUser?.id],
  );

  return {
    getTeamChannel,
    getTeamUsers,
    createDirectMessageChannel,
    filterTeamParticipants,
  };
};
