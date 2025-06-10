import sharp, { ResizeOptions } from 'sharp';

import { ImageType } from '@up-from/repository/s3/index';

function getImageResizeOptions(imageType: ImageType): ResizeOptions {
  if (imageType === 'avatar') return { width: 1024, height: 1024 };

  return { width: 1920, height: 1080 }; // Default for the rest types
}

export function getImageTransformStream(imageType: ImageType) {
  const resizeOptions = getImageResizeOptions(imageType);
  return sharp().timeout({ seconds: 8 }).resize(resizeOptions).toFormat('jpg', {});
}

export * as ImageConvert from './convert-image.js';
