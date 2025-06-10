import React, { FC, FormEvent, PropsWithChildren, ReactNode } from 'react';
import { Box, Button, Modal, Paper, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';
import clsx from 'clsx';
import { IconButtonComponent } from '~/components/Button/IconButtonComponent';
import styles from './modal.module.scss';

export type Props = PropsWithChildren & {
  className?: string;
  bodyClassName?: string;
  title?: string;
  isOpen: boolean;
  onClose?: () => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  buttons?: ReactNode | ReactNode[];
  headerBottom?: ReactNode | ReactNode[];
  withoutPadding?: boolean;
};

export const ModalComponent: FC<Props> = ({
  className,
  bodyClassName,
  title,
  onSubmit,
  isOpen,
  withoutPadding,
  onClose,
  children,
  buttons,
  headerBottom,
}) => {
  const modalContentNode = (
    <>
      {title ? (
        <Box className={styles.modalHeader}>
          <Box className={styles.modalHeaderTop}>
            <Typography variant="h6" component="h6">
              {title}
            </Typography>

            <IconButtonComponent color="inherit" onClick={onClose}>
              <Close />
            </IconButtonComponent>
          </Box>

          {headerBottom}
        </Box>
      ) : null}

      <Box className={clsx(styles.modalBody, withoutPadding && styles.modalBodyNoPadding, bodyClassName)}>
        {children}
      </Box>

      <Box className={styles.modalFooter}>
        <Button color="inherit" size="small" onClick={onClose}>
          Cancel
        </Button>

        {buttons}
      </Box>
    </>
  );

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby={title}>
      <Paper className={clsx(styles.modal, className)}>
        {onSubmit ? <form onSubmit={onSubmit}>{modalContentNode}</form> : modalContentNode}
      </Paper>
    </Modal>
  );
};
