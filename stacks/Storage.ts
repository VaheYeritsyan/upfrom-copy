import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Bucket, StackContext, BucketProps } from 'sst/constructs';

function getPublicBucketProps(isLocalApp: boolean): BucketProps {
  const defaultProps = {
    removalPolicy: RemovalPolicy.RETAIN,
  };

  const localProps = {
    // Avoid orphaned buckets for local apps
    removalPolicy: RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
  };

  const envProps = isLocalApp ? localProps : defaultProps;

  return {
    cdk: {
      bucket: {
        ...envProps,
        publicReadAccess: true,
        // Block Public Access is explained here:
        // https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html
        blockPublicAccess: {
          blockPublicAcls: true,
          ignorePublicAcls: true,
          blockPublicPolicy: false,
          restrictPublicBuckets: false,
        },
      },
    },
  };
}

export function Storage({ stack, app }: StackContext) {
  const avatarImages = new Bucket(stack, 'avatarImages', getPublicBucketProps(app.local));
  const eventImages = new Bucket(stack, 'eventImages', getPublicBucketProps(app.local));
  const teamImages = new Bucket(stack, 'teamImages', getPublicBucketProps(app.local));
  const organizationImages = new Bucket(stack, 'organizationImages', getPublicBucketProps(app.local));

  // Temporary storage for original images.
  // Each image in this private bucket should be resized and moved to a public bucket (to avatarImages, eventImages, teamImages...)
  const uploadImages = new Bucket(stack, 'uploadImages', {
    cdk: {
      bucket: {
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY,
        publicReadAccess: false,
        // Block Public Access is explained here:
        // https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html
        blockPublicAccess: {
          blockPublicAcls: true,
          ignorePublicAcls: true,
          blockPublicPolicy: true,
          restrictPublicBuckets: true,
        },
        lifecycleRules: [
          {
            abortIncompleteMultipartUploadAfter: Duration.days(1),
            expiration: Duration.days(1),
          },
        ],
      },
    },
  });

  return {
    avatarImages,
    eventImages,
    organizationImages,
    teamImages,
    uploadImages,
  };
}
