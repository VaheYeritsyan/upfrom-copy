import React, { FC } from 'react';
import { MenuBoard } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { ActionModal, Props as ActionModalProps } from '~Components/Modals/ActionModal';
import { Button } from '~Components/Button';

type Props = Pick<ActionModalProps, 'isVisible' | 'onClose'> & {
  onAcceptPress: () => void;
  onDeclinePress: () => void;
  isDisabled: boolean;
};

export const RespondToEventInvitationModal: FC<Props> = ({ onAcceptPress, onDeclinePress, isDisabled, ...props }) => (
  <ActionModal
    headerStartAdornment={<MenuBoard size={24} color={colors.black} variant="Bold" />}
    title="Respond to Invitation"
    {...props}>
    <Button
      text="Accept"
      color="blueGradient"
      size="large"
      shape="rectangle"
      disabled={isDisabled}
      fullWidth
      onPress={onAcceptPress}
    />
    <Button
      text="Decline"
      color="black"
      size="large"
      shape="rectangle"
      disabled={isDisabled}
      fullWidth
      onPress={onDeclinePress}
    />
  </ActionModal>
);
