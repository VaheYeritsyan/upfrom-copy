import React, { FC } from 'react';
import { Apple, Google, TickCircle } from 'iconsax-react-native';
import { Platform } from 'react-native';
import { colors } from '~Theme/Colors';
import { ActionModal, Props as ActionModalProps } from '~Components/Modals/ActionModal';
import { Button } from '~Components/Button';

type Props = Pick<ActionModalProps, 'isVisible' | 'onClose'> & {
  onAddToCalendarPress: () => void;
  isDisabled?: boolean;
  isAllTeamsEvent: boolean;
};

const isIOS = Platform.OS === 'ios';
const SystemCalendarIcon = isIOS ? Apple : Google;

export const AddEventToCalendarModal: FC<Props> = ({ onAddToCalendarPress, isAllTeamsEvent, isDisabled, ...props }) => {
  const iconColor = isAllTeamsEvent ? colors.purpleGradientStart : colors.primaryMain;

  return (
    <ActionModal
      headerStartAdornment={<TickCircle size={24} color={iconColor} variant="Bold" />}
      title="You are attending"
      {...props}>
      <Button
        text="Add to Calendar"
        color="white"
        size="large"
        shape="rectangle"
        disabled={isDisabled}
        fullWidth
        onPress={onAddToCalendarPress}
        startAdornment={<SystemCalendarIcon color={iconColor} variant="Bold" size={20} />}
      />
    </ActionModal>
  );
};
