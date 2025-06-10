import React, { FC, PropsWithChildren } from 'react';
import { Box, CircularProgress } from '@mui/material';
import styles from './loading-wrapper-component.module.scss';

type Props = PropsWithChildren & {
  isLoading?: boolean;
};

export const LoadingWrapperComponent: FC<Props> = ({ isLoading, children }) =>
  isLoading ? (
    <Box className={styles.loadingWrapper}>
      <CircularProgress />
    </Box>
  ) : (
    <>{children}</>
  );
