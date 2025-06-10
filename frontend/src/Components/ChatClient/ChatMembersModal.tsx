import React, { FC } from 'react';
import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import { ChannelMemberResponse } from 'stream-chat';
import { ActionModal, Props as ActionModalProps } from '~Components/Modals/ActionModal';
import { getPlural } from '~utils/textFormat';
import { EntityCard } from '~Components/EntityCard';

type Props = Pick<ActionModalProps, 'isVisible' | 'onClose'> & {
  chatEntityName: string;
  members: ChannelMemberResponse[];
  onMemberPress: (id: string) => void;
};

export const ChatMembersModal: FC<Props> = ({ chatEntityName, members, onMemberPress, ...props }) => {
  const membersCount = members.length;

  return (
    <ActionModal
      title={`${chatEntityName} Members`}
      subtitle={`${membersCount} ${getPlural('Member', membersCount)}`}
      {...props}>
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {members.map(member => (
          <EntityCard
            key={member.user!.id}
            style={styles.memberCard}
            avatarSize={42}
            isDisabledEntity={!!member.user?.deactivated_at}
            typographyVariant="body1SemiBold"
            avatarUrl={member.user!.image as string}
            name={member?.user!.name!}
            onPress={() => onMemberPress(member.user!.id)}
          />
        ))}
      </ScrollView>
    </ActionModal>
  );
};

const screenHeight = Dimensions.get('window').height;
const contentHeight = Math.min(screenHeight / 2, 250);

const styles = StyleSheet.create({
  memberCard: {
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
    padding: 0,
  },
  listContainer: {
    maxHeight: contentHeight,
  },
  list: {
    gap: 14,
  },
});
