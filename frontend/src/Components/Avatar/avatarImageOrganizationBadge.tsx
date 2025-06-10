import React, { FC, useMemo } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Organization } from '@up-from/graphql/genql';
import { getInitials } from '~utils/textFormat';
import { getColorFromString } from '~utils/color';
import { useOrganizationModalsContext } from '~Hooks/useOrganizationContext';
import { Typography } from '~Components/Typography';
import { HexagonBordered } from '~Components/Hexagon/HexagonBordered';
import { colors } from '~Theme/Colors';

export type Props = {
  style?: StyleProp<ViewStyle>;
  size: number;
};

export type BriefOrganization = Pick<Organization, 'id' | 'name' | 'details'>;

export const getAvatarImageOrganizationBadge =
  <Org extends BriefOrganization>(org: Org | null, isDisabled?: boolean): FC<Props> =>
  ({ style, size }) => {
    const { setOrganizationMeta } = useOrganizationModalsContext();

    const initials = useMemo(() => (org ? getInitials(org.name) : ''), [org?.name]);

    const initialsStyle = {
      fontSize: size / 2.5,
      lineHeight: size / 1.35,
      letterSpacing: 0,
    };

    const handleOrganizationPress = () => {
      if (!org || isDisabled) return;

      setOrganizationMeta(org);
    };

    return org ? (
      <TouchableOpacity
        style={[styles.container, { width: size, height: size }, style]}
        onPress={handleOrganizationPress}
        disabled={isDisabled}
        activeOpacity={1}>
        <HexagonBordered size={size} borderWidth={4} withShadow color={getColorFromString(org.id)}>
          <Typography style={[styles.initials, initialsStyle]} variant="body1Bold">
            {initials}
          </Typography>
        </HexagonBordered>
      </TouchableOpacity>
    ) : null;
  };

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: colors.white,
  },
});
