import React, { FC } from 'react';
import { Trash } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { Button } from '~Components/Button';
import { ActionModal, Props as ActionModalProps } from '~Components/Modals/ActionModal';

type Props = Pick<ActionModalProps, 'isVisible' | 'onClose'> & {
  onDeletePress: () => void;
  isDisabled: boolean;
};

export const DeleteEventConfirmation: FC<Props> = ({ isDisabled, onDeletePress, ...props }) => (
  <ActionModal
    headerStartAdornment={<Trash size={24} color={colors.grey400} variant="Bold" />}
    title="Are you sure?"
    {...props}>
    <Button
      text="Delete"
      size="large"
      shape="rectangle"
      color="black"
      fullWidth
      onPress={onDeletePress}
      disabled={isDisabled}
    />
  </ActionModal>
);
