import React, { FC, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { Google } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { API_AUTH_URL } from '~/constants/config';
import { useAuthContext } from '~/contexts/authContext';
import { Pages } from '~/constants/pages';
import { SeoComponent } from '~/components/Seo/SeoComponent';
import styles from './login-page.module.scss';

const LoginPage: FC = () => {
  const { push } = useRouter();
  const { token } = useAuthContext();

  useEffect(() => {
    if (!token) return;

    push(Pages.DASHBOARD);
  }, []);

  return (
    <>
      <SeoComponent title="Login" />

      <main className={styles.loginPage}>
        <Box className={styles.loginPageContent}>
          <Box className={styles.loginPageMain}>
            <Typography variant="body2" align="center">
              UpFrom: Login
            </Typography>
            <Typography variant="h4" align="center">
              Admin Panel
            </Typography>
          </Box>

          <Typography className={styles.loginLink} variant="subtitle1" align="center">
            <Google color="primary" />
            <a href={API_AUTH_URL}>Log in with Google</a>
          </Typography>
        </Box>
      </main>
    </>
  );
};

export default LoginPage;
