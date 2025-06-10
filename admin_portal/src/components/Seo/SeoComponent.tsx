import React, { FC } from 'react';
import Head from 'next/head';

type Props = {
  title: string;
};

export const SeoComponent: FC<Props> = ({ title }) => (
  <Head>
    <title>UpFrom: {title}</title>
  </Head>
);
