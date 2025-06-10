import React, { FC, PropsWithChildren, SyntheticEvent } from 'react';
import { Paper, Tab, Tabs } from '@mui/material';
import clsx from 'clsx';
import styles from './link-tabs.module.scss';
import { usePathname, useRouter } from 'next/navigation';

type TabType = {
  label: string;
  path: string;
};

type Props = PropsWithChildren & {
  className?: string;
  tabs: TabType[];
};

export const LinkTabsComponent: FC<Props> = ({ className, tabs, children }) => {
  const pathname = usePathname();
  const { push } = useRouter();

  const handleChange = (_: SyntheticEvent, path: TabType['path']) => {
    push(path);
  };

  return (
    <Paper className={clsx(styles.linkTabs, className)}>
      <Tabs value={pathname || window.location.pathname} onChange={handleChange}>
        {tabs.map(({ label, path }) => (
          <Tab key={path} value={path} label={label} />
        ))}
      </Tabs>

      {children}
    </Paper>
  );
};
