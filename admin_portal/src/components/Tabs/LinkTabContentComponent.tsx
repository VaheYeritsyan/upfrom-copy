import React, { FC, PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';

type Props = PropsWithChildren & {
  path: string;
};

export const LinkTabContentComponent: FC<Props> = ({ children, path }) => {
  const pathname = usePathname();

  return pathname === path ? <>{children}</> : null;
};
