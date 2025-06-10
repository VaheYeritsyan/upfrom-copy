import { Admin } from '@up-from/repository/admin';
import { VisibleError, logger } from '@up-from/util';

export { AdminShape } from '@up-from/repository/admin';

const logName = 'Core Admin: Admin:';

export async function create(email: string, name?: string | null) {
  logger.debug(`${logName} Creating a new admin`, { email, name });
  return Admin.create({ email, name });
}

export async function findOneByEmail(email: string) {
  logger.debug(`${logName} Getting an admin by email`, { email });
  return Admin.findOneByEmailOrThrow(email);
}

export async function getAll() {
  logger.debug(`${logName} Getting all admins`);
  return Admin.getAll();
}

export async function disable(adminId: string) {
  logger.debug(`${logName} Disabling an Admin`, { adminId });

  const admin = await Admin.findOneByIdThrow(adminId);
  if (admin.isDisabled) {
    throw new VisibleError(`Failed to disable an admin: Admin account already disabled`, {
      isExposable: true,
      extraInput: { adminId },
    });
  }

  return Admin.updateOrThrow(adminId, { isDisabled: true });
}

export async function enable(adminId: string) {
  logger.debug(`${logName} Enabling an Admin`, { adminId });

  const admin = await Admin.findOneByIdThrow(adminId);
  if (admin.isDisabled === false) {
    throw new VisibleError(`Failed to enable an admin: Admin account already enabled`, {
      isExposable: true,
      extraInput: { adminId },
    });
  }

  return await Admin.updateOrThrow(adminId, { isDisabled: false });
}

export * as Admin from './admin.js';
