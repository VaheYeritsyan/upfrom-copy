import path from 'node:path';

import { VisibleError, logger } from '@up-from/util';

import { S3, ImageType } from './s3/index.js';

const logName = 'Repository File Storage:';

export async function removeImage(urlString: string, id: string, imageType: ImageType) {
  logger.debug(`${logName} Removing "${imageType}" image from S3`, { url: urlString, id, imageType });

  try {
    const url = S3.getValidUrl(urlString, id, imageType);
    const fileName = path.basename(url.pathname);
    return S3.deleteImage(fileName, imageType);
  } catch (err) {
    throw new VisibleError(`Failed to remove "${imageType}" image from S3`, {
      isExposable: true,
      cause: err,
      extraInput: { url: urlString, id, imageType },
    });
  }
}

export async function completeImageUpload(id: string, imageType: ImageType) {
  logger.debug(`${logName} Completing "${imageType}" image upload`, { id });

  const sourceFileName = S3.getUploadFileName(id, imageType);
  const destinationFileName = S3.createPublicImageFileName(id);

  try {
    await S3.completeImageUpload(sourceFileName, destinationFileName, imageType);
  } catch (err) {
    throw new VisibleError(`Failed to complete "${imageType}" image upload`, {
      isExposable: true,
      cause: err,
      extraInput: { id },
    });
  }

  return S3.getPublicImageUrl(destinationFileName, imageType);
}

export async function generateImageUploadUrl(id: string, type: S3.ImageType) {
  logger.debug(`${logName} Generating image upload URL`, { id, type });

  try {
    return S3.generatePutPresignedUrl(id, type);
  } catch (err) {
    throw new VisibleError('Failed to generate image upload URL', {
      isExposable: true,
      cause: err,
      extraInput: { id, type },
    });
  }
}

// Avatar
export async function generateAvatarUploadUrl(id: string) {
  logger.debug(`${logName} Generating avatar upload URL`, { id });
  return generateImageUploadUrl(id, 'avatar');
}

export async function removeAvatar(url: string, userId: string) {
  return removeImage(url, userId, 'avatar');
}

export async function completeAvatarUpload(userId: string) {
  logger.debug(`${logName} Completing avatar image upload`, { userId });
  return await completeImageUpload(userId, 'avatar');
}

export * as FileStorage from './file-storage.js';
