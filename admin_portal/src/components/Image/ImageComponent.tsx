import React, { FC, ImgHTMLAttributes, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { ImageShape } from '~/types/image';
import styles from './image.module.scss';

const placeholderSrc = '/placeholder-img.png';

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  shape?: ImageShape;
};

const shapeStyles = {
  [ImageShape.CIRCLE]: styles.imageCircle,
  [ImageShape.SQUARE]: styles.imageSquare,
};

export const ImageComponent: FC<Props> = ({ src = placeholderSrc, shape, alt = 'img', ...props }) => {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    ref.current?.setAttribute('src', src);
  }, [src]);

  const handleError = () => {
    ref.current?.setAttribute('src', placeholderSrc);
  };

  return (
    <img
      {...props}
      className={clsx(shape ? shapeStyles[shape] : null, props.className)}
      src={src}
      alt={alt}
      ref={ref}
      onError={handleError}
    />
  );
};
