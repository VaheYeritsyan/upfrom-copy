import path from 'node:path';

import { ulid } from 'ulid';
import { Bucket } from 'sst/node/bucket';
import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { VisibleError, logger } from '@up-from/util';
import { ImageUpload } from './upload-image.js';

export type ImageType = 'avatar' | 'event' | 'team' | 'organization';

const logName = 'Repository S3:';

const client = new S3Client({ region: 'us-east-1' });

const expectedFileNameLength = 57; // File name example: "01H66SPHDK3A9KEJ5FW8YP7KEG-03166SPHDK3A9KEJ5FW8YPYDE4.jpg"
const expectedOldFileNameLength = 30; // Old file name example: "01H66SPHDK3A9KEJ5FW8YP7KEG.jpg"

async function getFileMetadata(bucketName: string, fileName: string) {
  try {
    const command = new HeadObjectCommand({ Bucket: bucketName, Key: fileName });
    const headObject = await client.send(command);

    if (!headObject.Metadata) {
      throw new VisibleError('No Metadata in head object!', {
        extraInput: { headObject, bucketName, fileName },
      });
    }

    return headObject.Metadata;
  } catch (err) {
    throw new VisibleError('Failed to get metadata!', {
      cause: err,
      extraInput: { fileName, bucketName },
    });
  }
}

function getBucketName(imageType: ImageType) {
  if (imageType === 'avatar') return Bucket.avatarImages.bucketName;
  if (imageType === 'event') return Bucket.eventImages.bucketName;
  if (imageType === 'team') return Bucket.teamImages.bucketName;
  if (imageType === 'organization') return Bucket.organizationImages.bucketName;

  throw new VisibleError('Failed to get bucket name: Unknown image type', {
    isExposable: false,
    extraInput: { imageType },
  });
}

export function getUploadFileName(id: string, imageType: ImageType) {
  return `${imageType}_${id}`;
}

export function createPublicImageFileName(id: string) {
  return `${id}-${ulid()}.jpg`;
}

export function getValidUrl(urlString: string, entityId: string, imageType: ImageType) {
  let url;
  try {
    url = new URL(urlString);
  } catch (err) {
    throw new VisibleError(`Invalid URL: Failed to parse URL`, {
      extraInput: { url, entityId, imageType },
    });
  }

  // Host name check
  const bucketName = getBucketName(imageType);
  const expectedHostName = `${bucketName}.s3.amazonaws.com`;
  if (url.hostname !== expectedHostName) {
    throw new VisibleError(`Invalid URL: Unknown host name`, {
      extraInput: { url, expectedHostName, entityId, imageType },
    });
  }

  // File name check
  const fileName = path.basename(url.pathname);
  if (fileName.length === expectedFileNameLength) {
    // New file name
    if (!fileName.startsWith(`${entityId}-`) || !fileName.endsWith('.jpg')) {
      throw new VisibleError(`Invalid URL: Invalid file name`, {
        serviceMessage: 'Invalid name pattern',
        extraInput: { url, fileName, entityId, isFileNameDeprecated: false },
      });
    }
  } else if (fileName.length === expectedOldFileNameLength) {
    // Deprecated file name
    if (fileName !== `${entityId}.jpg`) {
      throw new VisibleError(`Invalid URL: Invalid file name`, {
        serviceMessage: 'Invalid name pattern',
        extraInput: { url, fileName, entityId, isFileNameDeprecated: true },
      });
    }
  } else {
    // Invalid file name (invalid length)
    throw new VisibleError(`Invalid URL: Invalid file name`, {
      serviceMessage: 'Invalid file name length',
      extraInput: { url, fileName, entityId },
    });
  }

  return url;
}

export function getPublicImageUrl(fileName: string, imageType: ImageType) {
  const bucketName = getBucketName(imageType);
  return `https://${bucketName}.s3.amazonaws.com/${fileName}`;
}

export async function generatePutPresignedUrl(id: string, imageType: ImageType) {
  logger.debug(`${logName} Generating Put presigned URL`, { id, imageType });

  const fileName = getUploadFileName(id, imageType);
  const command = new PutObjectCommand({
    Bucket: Bucket.uploadImages.bucketName,
    Key: fileName,
    ContentType: 'image/jpeg',
    Metadata: {
      image_type: imageType,
    },
  });

  return getSignedUrl(client, command);
}

export function deleteImage(fileName: string, imageType: ImageType) {
  const bucketName = getBucketName(imageType);
  const deleteCommand = new DeleteObjectCommand({ Bucket: bucketName, Key: fileName });
  return client.send(deleteCommand);
}

export async function completeImageUpload(sourceFileName: string, destinationFileName: string, imageType: ImageType) {
  const sourceBucketName = Bucket.uploadImages.bucketName;
  const destinationBucketName = getBucketName(imageType);

  const metadata = await getFileMetadata(sourceBucketName, sourceFileName);
  if (imageType !== metadata.image_type) {
    throw new VisibleError('Image type mismatch!', {
      extraInput: {
        requestedImageType: imageType,
        metadataImageType: metadata.image_type,
      },
    });
  }

  const options = {
    sourceFileName,
    sourceBucketName,
    destinationFileName,
    destinationBucketName,
    imageType,
  };
  return ImageUpload.completeImageUpload(client, options);
}

export * as S3 from './index.js';
