import React, { FC } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { CloseCircle, TickCircle } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { Button } from '~Components/Button';

export type Props = ViewProps & {
  onSelectAllPress: () => void;
  onClearAllPress: () => void;
  isSelectedAll?: boolean;
};

export const ListControls: FC<Props> = ({ style, isSelectedAll, onSelectAllPress, onClearAllPress, ...props }) => (
  <View {...props} style={[styles.container, style]}>
    {isSelectedAll ? (
      <Button
        startAdornment={<CloseCircle size={16} variant="Bold" color={colors.grey600} />}
        shape="pill"
        size="small"
        color="white"
        text="Clear All"
        onPress={onClearAllPress}
      />
    ) : (
      <Button
        startAdornment={<TickCircle size={16} variant="Bold" color={colors.grey600} />}
        shape="pill"
        size="small"
        color="white"
        text="Select All"
        onPress={onSelectAllPress}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
});
