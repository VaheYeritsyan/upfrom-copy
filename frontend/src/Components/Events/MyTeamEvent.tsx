import React, { FC, PropsWithChildren } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { User, Team } from '@up-from/graphql/genql';
import { Profile2User } from 'iconsax-react-native';
import { Typography } from '~Components/Typography';
import { EntityCard } from '~Components/EntityCard';
import { Divider } from '~Components/Divider';
import { EventFormSectionHeader } from '~Components/Events/EventFormSectionHeader';
import { TeamSelector } from '~Components/TeamSelector';

type Props = PropsWithChildren & {
  style?: ViewProps['style'];
  team: Team | null;
  teams: Team[];
  handleTeamChange: (team: Team) => void;
  isLoading?: boolean;
  attendee: Pick<User, 'avatarUrl' | 'firstName' | 'lastName' | 'id'>;
  onAttendeePress: (id: string) => void;
};

export const MyTeamEvent: FC<Props> = ({
  style,
  attendee,
  isLoading,
  team,
  teams,
  handleTeamChange,
  onAttendeePress,
  children,
}) => (
  <View style={style}>
    <View style={styles.section}>
      <Typography variant="body1SemiBold">You are creating a Team Event with the mentee.</Typography>
      <TeamSelector value={team} isLoading={isLoading} teams={teams} handleChange={handleTeamChange} />
    </View>

    <Divider />

    <View style={styles.section}>
      <Typography variant="h4">Who is attending?</Typography>
      <View style={styles.list}>
        <EntityCard
          key={attendee.id}
          name={`${attendee.firstName} ${attendee.lastName}`}
          avatarUrl={attendee.avatarUrl ?? undefined}
          onPress={() => onAttendeePress(attendee.id)}
        />
      </View>
    </View>

    <Divider />

    <View style={styles.section}>{children}</View>

    <Divider />

    <EventFormSectionHeader
      title="Visibility"
      text="are visible to your team members only."
      boldText="My Team Events"
      Icon={Profile2User}
      iconVariant="Bulk"
    />
  </View>
);

const styles = StyleSheet.create({
  section: {
    gap: 18,
  },
  list: {
    gap: 12,
  },
});
