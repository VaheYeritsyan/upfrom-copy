import { ulid } from 'ulid';

import { VisibleError, logger } from '@up-from/util';

import { SQL, InsertableType, SelectableType, UpdateableType } from '#sql';

export type AdminShape = SelectableType['admin'];

type AdminInsertable = InsertableType['admin'];
export type AdminDraft = Omit<AdminInsertable, 'createdAt' | 'updatedAt' | 'id'>;

type AdminUpdateable = UpdateableType['admin'];
export type AdminUpdateArgs = Omit<AdminUpdateable, 'id' | 'createdAt'>;

export const tableName = 'admin';

const logName = 'Repository Admin:';

export async function create(adminDraft: AdminDraft) {
  logger.debug(`${logName} Creating a new Admin`, { adminDraft });

  const id = ulid();
  try {
    const [admin] = await SQL.DB.insertInto(tableName)
      .values({ ...adminDraft, id })
      .returningAll()
      .execute();
    return admin;
  } catch (err) {
    if (err instanceof Error) {
      if (err?.message?.includes('duplicate key value violates unique constraint')) {
        throw new VisibleError('Failed to create a new Admin: Admin with this email address already exists!', {
          cause: err,
          isExposable: false,
          extraInput: { adminDraft },
        });
      }
    }
    throw new VisibleError('Failed to create a new Admin!', {
      cause: err,
      isExposable: true,
      extraInput: { adminDraft },
    });
  }
}

export async function updateOrThrow(adminId: string, args: AdminUpdateArgs) {
  logger.debug(`${logName} Updating an Admin`, { adminId, args });

  if (!Object.keys(args).length) {
    throw new VisibleError('Failed to update admin: Update arguments are not provided', {
      isExposable: true,
      extraInput: { adminId, args },
    });
  }

  try {
    return await SQL.DB.updateTable(tableName)
      .set({ ...args })
      .where('id', '=', adminId)
      .returningAll()
      .executeTakeFirstOrThrow();
  } catch (err) {
    if (err instanceof Error && err?.message === 'no result') {
      throw new VisibleError('Failed to update an admin: Admin does not exist!', {
        cause: err,
        isExposable: true,
        extraInput: { adminId, args },
      });
    }

    throw new VisibleError('Failed to update an Admin', {
      isExposable: true,
      cause: err,
      extraInput: { adminId, args },
    });
  }
}

export async function findOneByIdThrow(id: string) {
  logger.debug(`${logName} Selecting an Admin by ID`, { id });

  try {
    return await SQL.DB.selectFrom(tableName).selectAll().where('id', '=', id).executeTakeFirstOrThrow();
  } catch (err) {
    if (err instanceof Error && err?.message === 'no result') {
      throw new VisibleError('Failed to find an Admin by ID: Admin with this ID does not exist!', {
        cause: err,
        isExposable: true,
        extraInput: { id },
      });
    }

    throw new VisibleError('Failed to find an Admin', {
      cause: err,
      isExposable: true,
      extraInput: { id },
    });
  }
}

export async function findOneByEmailOrThrow(email: string) {
  logger.debug(`${logName} Selecting an active Admin by email`, { email });

  try {
    return await SQL.DB.selectFrom(tableName)
      .selectAll()
      .where('email', '=', email)
      .where('isDisabled', 'is', false)
      .executeTakeFirstOrThrow();
  } catch (err) {
    if (err instanceof Error && err?.message === 'no result') {
      throw new VisibleError('Failed to find Admin by email: Admin with this email does not exist!', {
        cause: err,
        isExposable: true,
        serviceMessage: 'Admin with this email does not exist or admin account is disabled',
        extraInput: { email },
      });
    }

    throw new VisibleError('Failed to find an Admin!', {
      cause: err,
      isExposable: true,
      extraInput: { email },
    });
  }
}

export async function getAll() {
  logger.debug(`${logName} Selecting all Admins`);

  try {
    return await SQL.DB.selectFrom(tableName).selectAll().execute();
  } catch (err) {
    throw new VisibleError('Failed to get all Admins', {
      cause: err,
      isExposable: true,
    });
  }
}

export * as Admin from './admin.js';
