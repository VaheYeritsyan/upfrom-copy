import React, { FC, useEffect, useState } from 'react';
import FastImage, { FastImageProps } from 'react-native-fast-image';

export type Props = Omit<FastImageProps, 'source'> & {
  url?: string;
  source?: FastImageProps['source'];
  placeholder?: FastImageProps['defaultSource'];
};

const sourceConfig = { cache: FastImage.cacheControl.immutable };

export const Image: FC<Props> = ({ style, url, source, placeholder, ...props }) => {
  const [imgSource, setSource] = useState<FastImageProps['source']>(source || { uri: url, ...sourceConfig });

  useEffect(() => {
    if (!url && !source) return;

    setSource(source || { uri: url, ...sourceConfig });
  }, [url, source]);

  const handleError = () => {
    if (!placeholder) return;

    setSource(placeholder);
  };

  return <FastImage {...props} defaultSource={placeholder} style={style} source={imgSource} onError={handleError} />;
};
