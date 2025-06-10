import React, { FC } from 'react';
import { Tooltip, Box } from '@mui/material';
import { ImageShape } from '~/types/image';
import { ImageComponent } from '~/components/Image/ImageComponent';
import styles from './table-cell-img.module.scss';

export type Props = {
  className?: string;
  src?: string;
  imageShape?: ImageShape;
};

export const TableCellImgComponent: FC<Props> = ({ imageShape, src }) => (
  <Tooltip
    slotProps={{ tooltip: { className: styles.tableImgCellTooltip } }}
    placement="right-start"
    title={<ImageComponent className={styles.tableImgCellPreview} src={src} />}>
    <Box>
      <ImageComponent className={styles.tableImgCell} shape={imageShape} src={src} />
    </Box>
  </Tooltip>
);
