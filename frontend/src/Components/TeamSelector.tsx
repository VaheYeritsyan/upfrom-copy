import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, StyleProp, ViewStyle } from 'react-native';
import { Team } from '@up-from/graphql/genql';
import { Typography } from '~Components/Typography';
import { EntityCard } from '~Components/EntityCard';
import { effects } from '~Theme/Effects';
import { colors } from '~Theme/Colors';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { getAvatarImageOrganizationBadge } from '~Components/Avatar/avatarImageOrganizationBadge';
import { ArrowDown2 } from 'iconsax-react-native';
import { ActionModal } from '~Components/Modals/ActionModal';
import { EmptyPlaceholder } from '~Components/EmptyPlaceholder';

export type Props<T extends Team> = {
  style?: StyleProp<ViewStyle>;
  value: T | null;
  isLoading?: boolean;
  teams: T[];
  handleChange: (team: T) => void;
};

export const TeamSelector = <T extends Team>({ style, isLoading, teams, value, handleChange }: Props<T>) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    setIsModalVisible(false);
  }, [value?.id]);

  const handlePress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const AvatarBadge = useMemo(() => {
    if (!value) return;

    return getAvatarImageOrganizationBadge(value?.organization);
  }, [value?.organization]);

  const emptyPlaceholderText = useMemo(() => {
    if (isLoading) return 'Loading...';
    if (!teams.length) return 'You don’t have teams';
    if (!value) return 'Select a team';

    return null;
  }, [isLoading, value, teams.length]);

  return (
    <View>
      <TouchableOpacity
        style={[styles.container, style]}
        disabled={isLoading || !teams.length}
        onPress={handlePress}
        activeOpacity={0.8}>
        <Typography variant="body1SemiBold">Select a Team</Typography>
        {emptyPlaceholderText ? (
          <EmptyPlaceholder title={emptyPlaceholderText} height={82} />
        ) : (
          <EntityCard
            name={value!.name}
            avatarUrl={value!.imageUrl ?? undefined}
            AvatarBadge={AvatarBadge}
            avatarSize={40}
            avatarType="square"
            typographyVariant="h5"
            onPress={handlePress}
            endAdornment={<ArrowDown2 size={18} color={colors.grey400} />}
          />
        )}
      </TouchableOpacity>

      <ActionModal isVisible={isModalVisible} onClose={handleCloseModal} title="Select a Team" isTitleLeftAligned>
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}>
          {teams.map(team => (
            <EntityCard
              key={team.id}
              style={styles.teamCard}
              avatarSize={56}
              isChecked={team.id === value?.id}
              avatarType="square"
              typographyVariant="h5"
              avatarUrl={team.imageUrl ?? undefined}
              AvatarBadge={getAvatarImageOrganizationBadge(team.organization)}
              name={team.name!}
              onPress={() => handleChange(team)}
            />
          ))}
        </ScrollView>
      </ActionModal>
    </View>
  );
};

const screenHeight = Dimensions.get('window').height;
const contentHeight = Math.min(screenHeight / 1.5, 350);

const styles = StyleSheet.create({
  container: {
    ...effects.shadow1,
    padding: 20,
    borderWidth: 0.5,
    borderColor: colors.grey200,
    borderRadius: 8,
    gap: 20,
    backgroundColor: colors.white,
  },
  listContainer: {
    maxHeight: contentHeight,
  },
  list: {
    gap: 20,
    paddingBottom: 100,
  },
  teamCard: {
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
    padding: 0,
  },
});
