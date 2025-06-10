import React, { FC, PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { SeoComponent } from '~/components/Seo/SeoComponent';
import { HeaderComponent } from '~/components/Header/HeaderComponent';
import styles from './main-layout.module.scss';

type Props = PropsWithChildren & {
  title: string;
};

export const MainLayout: FC<Props> = ({ title, children }) => (
  <>
    <SeoComponent title={title} />

    <main className={styles.mainLayout}>
      <HeaderComponent />

      <Box className={styles.mainLayoutContent}>{children}</Box>
    </main>
  </>
);
