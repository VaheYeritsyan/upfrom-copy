import React, { FC } from 'react';
import { TickCircle } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { ActionModal, Props as ActionModalProps } from '~Components/Modals/ActionModal';
import { Button } from '~Components/Button';

type Props = Pick<ActionModalProps, 'isVisible' | 'onClose'> & {
  onLeavePress: () => void;
  isDisabled: boolean;
  isAllTeamsEvent?: boolean;
};

export const YouAreAttendingModal: FC<Props> = ({ onLeavePress, isAllTeamsEvent, isDisabled, ...props }) => (
  <ActionModal
    headerStartAdornment={
      <TickCircle size={24} color={isAllTeamsEvent ? colors.purpleGradientStart : colors.primaryMain} variant="Bold" />
    }
    title="You are attending"
    {...props}>
    <Button
      text="Leave Event"
      size="large"
      shape="rectangle"
      color="black"
      fullWidth
      onPress={onLeavePress}
      disabled={isDisabled}
    />
  </ActionModal>
);
