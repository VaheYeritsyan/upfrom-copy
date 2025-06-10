import React, { FC } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { TeamUser } from '@up-from/graphql/genql';
import { Typography } from '~Components/Typography';
import { EntityInfo } from '~Components/EntityInfo';
import { colors } from '~Theme/Colors';
import { getPlural } from '~utils/textFormat';

type Props = {
  members: Pick<TeamUser, 'user' | 'role'>[];
  onMemberPress: (memberId: string) => void;
};

export const TeamMembers: FC<Props> = ({ members, onMemberPress }) => {
  const membersCount = members.length;
  const membersInPlural = getPlural('member', membersCount);

  return (
    <>
      <View style={styles.header}>
        <Typography style={styles.textBlack} variant="h4">
          Members
        </Typography>
        <Typography style={styles.textGrey} variant="body1Medium">
          {membersCount} {membersInPlural}
        </Typography>
      </View>

      <View style={styles.list}>
        {members.map(({ user }) =>
          user ? (
            <TouchableOpacity key={user.id} onPress={() => onMemberPress(user.id)} activeOpacity={0.6}>
              <EntityInfo fullName={`${user.firstName} ${user.lastName}`} avatarUrl={user.avatarUrl ?? undefined} />
            </TouchableOpacity>
          ) : null,
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: 4,
  },
  list: {
    marginTop: 24,
    gap: 12,
  },
  textBlack: {
    color: colors.black,
  },
  textGrey: {
    color: colors.grey500,
  },
});
