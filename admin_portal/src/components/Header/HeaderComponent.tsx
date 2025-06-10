import React, { useMemo } from 'react';
import Link from 'next/link';
import { Button, Paper, Box, Tooltip } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useAuthContext } from '~/contexts/authContext';
import { Pages } from '~/constants/pages';
import { LinkTabsComponent } from '~/components/Tabs/LinkTabsComponent';
import styles from './header-component.module.scss';

export const HeaderComponent = () => {
  const { logOut } = useAuthContext();

  const tabs = useMemo(() => Pages.getNavigationTabs(), []);

  return (
    <Box className={styles.headerWrapper}>
      <Box className={styles.header}>
        <Paper className={styles.headerBrandLinkContainer}>
          <Link className={styles.headerBrandLink} href={Pages.DASHBOARD}>
            UpFrom
          </Link>
        </Paper>

        <LinkTabsComponent className={styles.headerMain} tabs={tabs}>
          <Tooltip title="Log out">
            <Button className={styles.headerMainLogoutButton} size="small" onClick={logOut}>
              <Logout className={styles.headerMainLogoutButtonIcon} />
            </Button>
          </Tooltip>
        </LinkTabsComponent>
      </Box>
    </Box>
  );
};
