import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, MenuBoard, MessageText, ProfileCircle } from 'iconsax-react-native';
import { Organization } from '@up-from/graphql/genql';
import { Typography } from '~Components/Typography';
import { Feature } from '~Components/Feature';
import { Divider } from '~Components/Divider';
import { ShortcutButton } from '~Components/ShortcutButton';
import { getMonthAndYear } from '~utils/dateFormat';
import { colors } from '~Theme/Colors';
import { EntityInfo } from '~Components/EntityInfo';
import { getPlural } from '~utils/textFormat';
import { getAvatarImageOrganizationBadge } from '~Components/Avatar/avatarImageOrganizationBadge';
import { EntityTeamInfoWithFooter } from '~Components/EntityTeamInfoFooter';

type Props = {
  imageUrl?: string;
  name: string;
  role: string;
  organization: Organization;
  description: string;
  createdAt: number | string;
  membersCount: number;
  handleMessagePress: () => void;
  handleEventsPress: () => void;
};

export const TeamInfo: FC<Props> = ({
  name,
  imageUrl,
  role,
  organization,
  description,
  membersCount,
  createdAt,
  handleMessagePress,
  handleEventsPress,
}) => {
  const date = getMonthAndYear(createdAt);
  const membersInPlural = getPlural('member', membersCount);

  return (
    <>
      <View style={styles.bodyTeamInfo}>
        <EntityInfo
          contentStyle={styles.bodyTeamInfoContent}
          fullName={name}
          avatarUrl={imageUrl}
          avatarSize={56}
          gap={12}
          avatarType="square"
          typographyVariant="h3"
          AvatarBadge={getAvatarImageOrganizationBadge(organization)}>
          <EntityTeamInfoWithFooter assignedAs={role} />
        </EntityInfo>

        <View>
          <Typography style={styles.textBlack} variant="h4">
            Details
          </Typography>
          <Typography style={styles.bodyDescription} variant="paragraph2">
            {description}
          </Typography>
        </View>

        <View style={styles.bodyFeatures}>
          <Feature Icon={ProfileCircle} iconVariant="Bold">
            {membersCount} {membersInPlural}
          </Feature>
          <Feature Icon={Calendar} iconVariant="Linear">
            Created {date}
          </Feature>
        </View>
      </View>

      <Divider />

      <View>
        <Typography style={styles.bodySectionName} variant="body1SemiBold">
          Links
        </Typography>

        <View style={styles.bodyTeamLinks}>
          <ShortcutButton Icon={MessageText} text="Team Chat" onPress={handleMessagePress} />
          <ShortcutButton Icon={MenuBoard} text="Events" onPress={handleEventsPress} />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey100 },
  headerText: {
    alignItems: 'center',
  },
  bodyContainer: {
    marginTop: 18,
    marginHorizontal: 24,
  },
  bodyTeamInfo: {
    gap: 32,
  },
  bodyTeamInfoContent: {
    gap: 6,
  },
  bodyHeadline: {
    color: colors.black,
  },
  bodySectionName: {
    color: colors.black,
  },
  bodyDescription: {
    marginTop: 18,
    color: colors.grey500,
  },
  bodyFeatures: {
    gap: 16,
  },
  bodyTeamLinks: {
    marginTop: 18,
    gap: 8,
    flexDirection: 'row',
  },
  textBlack: {
    color: colors.black,
  },
});
