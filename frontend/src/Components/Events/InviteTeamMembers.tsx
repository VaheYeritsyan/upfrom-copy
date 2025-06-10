import React, { FC, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { EntityCard } from '~Components/EntityCard';
import { EventFormSectionHeader } from '~Components/Events/EventFormSectionHeader';
import { ListControls, Props as ListControlsProps } from '~Components/ListControls';
import { TeamMember } from '~types/team';

type Props = Omit<ListControlsProps, 'isSelectedAll'> & {
  teamMembers: TeamMember[];
  invitedMembersIds: string[];
  onTeamMemberPress: (id: string) => void;
};

export const InviteTeamMembers: FC<Props> = ({
  teamMembers,
  invitedMembersIds,
  onTeamMemberPress,
  onSelectAllPress,
  onClearAllPress,
}) => {
  const memberIds = useMemo(() => teamMembers.map(({ user }) => user?.id), [teamMembers]);
  const isSelectedAll = useMemo(() => {
    return memberIds.every(id => invitedMembersIds.includes(id || ''));
  }, [memberIds, invitedMembersIds]);

  return (
    <>
      <EventFormSectionHeader
        title="Who is invited?"
        text={
          teamMembers.length ? 'You must invite at least one team member.' : 'You are only one member in your team.'
        }
      />
      <ListControls
        isSelectedAll={isSelectedAll}
        onSelectAllPress={onSelectAllPress}
        onClearAllPress={onClearAllPress}
      />
      {teamMembers.length ? (
        <View style={styles.list}>
          {teamMembers.map(({ user }) =>
            user ? (
              <EntityCard
                key={user.id}
                name={`${user.firstName} ${user.lastName}`}
                avatarUrl={user.avatarUrl || undefined}
                isChecked={invitedMembersIds.includes(user.id)}
                onPress={() => onTeamMemberPress(user.id)}
              />
            ) : null,
          )}
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
});
