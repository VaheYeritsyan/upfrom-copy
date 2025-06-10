import React, { FC, PropsWithChildren } from 'react';
import { ModalComponent } from '~/components/Modal/ModalComponent';
import { ContainedButtonComponent, Props as ButtonProps } from '~/components/Button/ContainedButtonComponent';

type Props = PropsWithChildren & {
  className?: string;
  isOpen: boolean;
  onClose?: () => void;
  actionText: string;
  isLoading?: boolean;
  buttonColor?: ButtonProps['color'];
  onActionClick?: () => void;
};

export const ConfirmationModalComponent: FC<Props> = ({
  actionText,
  buttonColor = 'error',
  onActionClick,
  isLoading,
  children,
  ...props
}) => (
  <ModalComponent
    {...props}
    title="Are you sure?"
    buttons={
      <ContainedButtonComponent
        color={buttonColor}
        size="small"
        variant="contained"
        onClick={onActionClick}
        type={onActionClick ? 'button' : 'submit'}
        isLoading={isLoading}>
        Yes, {actionText}
      </ContainedButtonComponent>
    }>
    {children}
  </ModalComponent>
);
