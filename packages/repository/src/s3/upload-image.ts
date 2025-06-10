import { pipeline } from 'node:stream/promises';
import stream from 'node:stream';

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

import { VisibleError, logger } from '@up-from/util';
import { getImageTransformStream } from './convert-image.js';

import { ImageType } from './index.js';

type CompleteUploadOptions = {
  sourceBucketName: string;
  sourceFileName: string;
  destinationBucketName: string;
  destinationFileName: string;
  imageType: ImageType;
};

const logName = 'Repository S3: Image Upload:';

async function getReadStream(s3client: S3Client, bucketName: string, fileName: string) {
  logger.debug(`${logName} Getting a read stream`, { bucketName, fileName });

  const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: fileName });
  const getOutput = await s3client.send(getCommand);

  const readStream: unknown = getOutput.Body?.transformToWebStream();
  if (!readStream) {
    throw new VisibleError('Failed to get read stream: No readable stream in getOutput!', {
      extraInput: { fileName, bucketName, getOutput },
    });
  }

  return readStream as stream.Readable;
}

export async function completeImageUpload(s3client: S3Client, options: CompleteUploadOptions) {
  logger.debug(`${logName} Resizing and moving an image`, { options });

  const { sourceBucketName, sourceFileName, destinationBucketName, destinationFileName, imageType } = options;

  const passStream = new stream.PassThrough();
  const transformStream = getImageTransformStream(imageType);
  const readStream = await getReadStream(s3client, sourceBucketName, sourceFileName);
  pipeline(readStream, transformStream, passStream).catch(err => {
    new VisibleError('Failed to resize an image: Stream pipeline failed!', {
      cause: err,
      extraInput: { sourceFileName, sourceBucketName, destinationBucketName, destinationFileName },
    });
  });

  try {
    const upload = new Upload({
      client: s3client,
      params: {
        Bucket: destinationBucketName,
        Key: destinationFileName,
        Body: passStream,
        ContentType: 'image/jpeg',
      },
    });

    const uploadResult = await upload.done();

    if (uploadResult.$metadata.httpStatusCode !== 200) {
      throw new VisibleError("Failed to upload resized image: Upload status code isn't 200!", {
        extraInput: { uploadResult, sourceFileName, sourceBucketName, destinationBucketName, destinationFileName },
      });
    }

    logger.info(`${logName} Resizing Image: Image successfully converted`, {
      destinationFileName,
      destinationBucketName,
      sourceFileName,
      sourceBucketName,
    });
  } catch (err) {
    throw new VisibleError('Failed to resize an image: Upload failed!', {
      cause: err,
      extraInput: { sourceFileName, sourceBucketName, destinationBucketName, destinationFileName },
    });
  }
}

export * as ImageUpload from './upload-image.js';
