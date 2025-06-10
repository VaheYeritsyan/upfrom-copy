import React, { FC } from 'react';
import { CloseCircle } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { ActionModal, Props as ActionModalProps } from '~Components/Modals/ActionModal';
import { Button } from '~Components/Button';

type Props = Pick<ActionModalProps, 'isVisible' | 'onClose'> & {
  onJoinPress: () => void;
  isDisabled: boolean;
};

export const YouAreNotAttendingModal: FC<Props> = ({ onJoinPress, isDisabled, ...props }) => (
  <ActionModal
    headerStartAdornment={<CloseCircle size={24} color={colors.grey400} variant="Bold" />}
    title="You are not attending"
    {...props}>
    <Button
      text="Join Event"
      size="large"
      shape="rectangle"
      color="blueGradient"
      fullWidth
      onPress={onJoinPress}
      disabled={isDisabled}
    />
  </ActionModal>
);
