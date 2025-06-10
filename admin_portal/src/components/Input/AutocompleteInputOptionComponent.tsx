import React, { FC, HTMLAttributes } from 'react';
import { Box, Typography } from '@mui/material';
import clsx from 'clsx';
import { ImageComponent } from '~/components/Image/ImageComponent';
import styles from './autocomplete-input-option.module.scss';

export type Props = HTMLAttributes<HTMLElement> & {
  imgSrc?: string | null;
  isImgCircle?: boolean;
  title: string;
  subtitle: string;
  withoutImg?: boolean;
};

export const AutocompleteInputOptionComponent: FC<Props> = ({
  imgSrc,
  isImgCircle = true,
  title,
  subtitle,
  withoutImg,
  ...props
}) => (
  <Box className={clsx(props.className, styles.autocompleteInputOption)} {...props}>
    {withoutImg ? null : (
      <ImageComponent
        className={clsx(
          styles.autocompleteInputOptionImg,
          isImgCircle ? styles.autocompleteInputOptionImgCircle : styles.autocompleteInputOptionImgSquare,
        )}
        src={imgSrc || ''}
        alt={title}
      />
    )}

    <Box className={styles.autocompleteInputOptionMain}>
      <Typography variant="subtitle1">{title}</Typography>
      <Typography variant="caption" color="textSecondary">
        {subtitle}
      </Typography>
    </Box>
  </Box>
);
