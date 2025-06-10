import { Organization, Team, FileStorage } from '@up-from/repository';
import { VisibleError, logger } from '@up-from/util';

export { OrganizationShape } from '@up-from/repository/organization';

const logName = 'Core Admin: Organization:';

const defaultImageUrl =
  'https://prod-up-from-storage-avatarimagesbucket10310826-13i9gxe5pny5v.s3.amazonaws.com/default_image.png';

export async function findOneById(orgId: string) {
  logger.debug(`${logName} Getting an organization`, { orgId });
  return Organization.findOneByIdOrThrow(orgId);
}

export async function getAll() {
  logger.debug(`${logName} Getting all organizations`);
  return Organization.getAll();
}

export async function findAllByNamePattern(namePattern?: string) {
  logger.debug(`${logName} Find multiple organizations by name pattern`, { namePattern });
  return Organization.findAllByNamePattern({ namePattern });
}

export async function getTotalAmount() {
  logger.debug(`${logName} Getting total amount of organization`);
  return Organization.getTotalAmount();
}

export async function create(orgDraft: Organization.OrganizationDraft) {
  logger.debug(`${logName} Creating a new organization`, { orgDraft });

  try {
    return await Organization.create(orgDraft);
  } catch (err) {
    throw new VisibleError('Failed to create a new organization', {
      isExposable: true,
      cause: err,
      extraInput: { orgDraft },
    });
  }
}

export async function update(organizationId: string, args: Organization.OrganizationUpdateable) {
  logger.debug(`${logName} Updating an organization`, { organizationId, args });

  return Organization.updateAsAdmin(organizationId, args);
}

export async function remove(organizationId: string) {
  logger.debug(`${logName} Removing an organization`, { organizationId });

  const teams = await Team.findAllByOrganizationId(organizationId);
  if (teams.length) {
    throw new VisibleError('Failed to remove an organization: This organization still has one or more teams', {
      isExposable: true,
      extraInput: { organizationId },
    });
  }

  return Organization.deleteOne(organizationId);
}

export async function generateImageUploadUrl(organizationId: string) {
  logger.debug(`${logName} Generating organization image upload url`, { organizationId });

  const organization = await Organization.findOneByIdOrThrow(organizationId);

  return FileStorage.generateImageUploadUrl(organization.id, 'organization');
}

export async function completeImageUpload(organizationId: string) {
  logger.debug(`${logName} Completing organization image upload`, { organizationId });

  const organization = await Organization.findOneByIdOrThrow(organizationId);
  const imageUrl = await FileStorage.completeImageUpload(organization.id, 'organization');
  return Organization.updateAsAdmin(organization.id, { imageUrl });
}

export async function removeImage(organizationId: string) {
  logger.debug(`${logName} Removing organization image`, { organizationId });

  const organization = await Organization.findOneByIdOrThrow(organizationId);
  if (!organization.imageUrl) {
    throw new VisibleError('Failed to remove organization image: Image does not exist', {
      isExposable: true,
      extraInput: { organizationId },
    });
  }

  if (organization.imageUrl === defaultImageUrl) {
    throw new VisibleError('Failed to remove organization image: Cannot remove default image', {
      isExposable: true,
      extraInput: { organizationId, imageUrl: organization.imageUrl },
    });
  }

  try {
    await FileStorage.removeImage(organization.imageUrl, organizationId, 'organization');
  } catch (err) {
    logger.warn(`${logName} Removing organization image: Failed to remove organization image from S3 bucket.`, {
      organizationId,
      url: organization.imageUrl,
      cause: err,
    });
  }

  return await Organization.updateAsAdmin(organizationId, { imageUrl: defaultImageUrl });
}

export * as Organization from './organization.js';
