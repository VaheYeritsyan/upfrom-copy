import React, { FC } from 'react';
import { Box, Typography } from '@mui/material';
import styles from './session-loading-component.module.scss';

export const SessionLoadingComponent: FC = () => (
  <Box className={styles.sessionLoading}>
    <Box className={styles.sessionLoadingContent}>
      <Box className={styles.sessionLoadingMain}>
        <Typography variant="body2" align="center">
          Loading, please wait
        </Typography>

        <Typography variant="h4" align="center">
          Authentication...
        </Typography>
      </Box>

      <Typography variant="subtitle1" align="center">
        It might take some time
      </Typography>
    </Box>
  </Box>
);
