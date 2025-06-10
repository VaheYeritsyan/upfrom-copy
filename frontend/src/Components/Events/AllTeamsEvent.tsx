import React, { FC, PropsWithChildren } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Global } from 'iconsax-react-native';
import { Typography } from '~Components/Typography';
import { EntityCard } from '~Components/EntityCard';
import { Divider } from '~Components/Divider';
import { EventFormSectionHeader } from '~Components/Events/EventFormSectionHeader';
import { colors } from '~Theme/Colors';
import { getPlural } from '~utils/textFormat';

const imgSrc = require('~assets/images/infinity.png');

type Props = PropsWithChildren & {
  style?: ViewProps['style'];
  teamsCount: number;
};

export const AllTeamsEvent: FC<Props> = ({ style, teamsCount, children }) => (
  <View style={style}>
    <View style={styles.section}>
      <Typography variant="body1SemiBold">You are creating an All Teams Event.</Typography>
      <EntityCard name="All Teams" avatarSource={imgSrc} avatarType="square">
        <View style={styles.cardBottom}>
          <Global size={14} variant="Bold" color={colors.grey500} />
          <Typography style={styles.cardBottomText} variant="body3Medium">
            {teamsCount} {getPlural('Team', teamsCount)}
          </Typography>
        </View>
      </EntityCard>
    </View>

    <Divider />

    <View style={[styles.section, styles.sectionRow]}>
      <Typography style={styles.attendingText} numberOfLines={2} variant="h4">
        Are you attending?
      </Typography>
      {children}
    </View>

    <Divider />

    <View style={styles.section}>
      <EventFormSectionHeader
        title="Who is invited?"
        boldText="All Teams Events"
        text="are available for all mentors to join."
      />
    </View>

    <Divider />

    <EventFormSectionHeader
      title="Visibility"
      text="are publicly visible to all teams and team members."
      boldText="All Teams Events"
      Icon={Global}
      iconVariant="Bold"
    />
  </View>
);

const styles = StyleSheet.create({
  section: {
    gap: 18,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attendingText: {
    flex: 1,
  },
  list: {
    gap: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardBottomText: {
    color: colors.grey500,
  },
});
