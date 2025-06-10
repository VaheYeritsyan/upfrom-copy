import React, { FC, FormEvent } from 'react';
import { ModalComponent, Props as ModalProps } from '~/components/Modal/ModalComponent';
import { ContainedButtonComponent } from '~/components/Button/ContainedButtonComponent';

type Props = ModalProps & {
  className?: string;
  title: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  actionText?: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onActionClick?: () => void;
};

export const ActionModalComponent: FC<Props> = ({
  actionText,
  title,
  children,
  isLoading,
  isDisabled,
  onActionClick,
  onSubmit,
  buttons,
  ...props
}) => (
  <ModalComponent
    {...props}
    title={title}
    onSubmit={onSubmit}
    buttons={
      <>
        {buttons}
        {actionText && (
          <ContainedButtonComponent
            color="primary"
            size="small"
            variant="contained"
            onClick={onActionClick}
            type={onSubmit || !onActionClick ? 'submit' : 'button'}
            disabled={isDisabled}
            isLoading={isLoading}>
            {actionText}
          </ContainedButtonComponent>
        )}
      </>
    }>
    {children}
  </ModalComponent>
);
