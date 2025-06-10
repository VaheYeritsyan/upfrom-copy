import { ulid } from 'ulid';

import { getUnifiedPhoneFormat, VisibleError, logger } from '@up-from/util';

import { SQL, InsertableType, SelectableType, UpdateableType } from '#sql';
import { loaders } from '#dataloader';

export type UserShape = SelectableType['user'];

type UserInsertable = InsertableType['user'];
export type UserDraft = Omit<UserInsertable, 'createdAt' | 'updatedAt' | 'id'>;

export type UserUniqueFindArgs = Partial<Pick<UserShape, 'phone' | 'email'>>;
export type UserFindArgs = Partial<Omit<UserShape, keyof UserUniqueFindArgs | 'id'>>;

export type UserUpdateable = UpdateableType['user'];
export type UserUpdateArgs = Omit<UserUpdateable, 'id' | 'createdAt'>;
export type UserUpdateManyArgs = Omit<UserUpdateable, 'id' | 'createdAt' | 'phone' | 'email'>;

export const tableName = 'user';

const logName = 'Repository User:';

export async function createWithAccount(userDraft: UserDraft) {
  logger.debug(`${logName} Creating a user with account`, { userDraft });

  const validDraft = { ...userDraft };
  if (userDraft.phone) {
    validDraft.phone = getUnifiedPhoneFormat(userDraft.phone);
  }

  const userId = ulid();

  try {
    return await SQL.DB.transaction().execute(async dbTransaction => {
      // Create user
      const newUser = await dbTransaction
        .insertInto(tableName)
        .values({ ...userDraft, id: userId })
        .returningAll()
        .executeTakeFirstOrThrow();

      // Update cache
      loaders.users.prime(newUser.id, newUser);

      return newUser;
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err?.message?.includes('duplicate key value violates unique constraint')) {
        throw new VisibleError('Cannot create user. User with this phone number or email address already exists!', {
          cause: err,
          isExposable: false,
          extraInput: { userDraft },
        });
      }
    }
    throw new VisibleError('Failed to create a user!', { cause: err, isExposable: true, extraInput: { userDraft } });
  }
}

export async function findOne(args: UserUniqueFindArgs) {
  logger.debug(`${logName} Selecting a user`, { args });

  if (!Object.keys(args).length) return;

  const validArgs = { ...args };
  if (args.phone) {
    validArgs.phone = getUnifiedPhoneFormat(args.phone);
  }

  try {
    const query = SQL.DB.selectFrom(tableName).selectAll();
    const user = await SQL.addWhereArgs(query, validArgs as Partial<UserShape>).executeTakeFirst();

    if (user) {
      loaders.users.prime(user.id, user);
    }

    return user;
  } catch (err) {
    throw new VisibleError('Failed to find a user', { cause: err, isExposable: true, extraInput: { args } });
  }
}

export async function getAllRegistered() {
  logger.debug(`${logName} Selecting all registered users`);

  try {
    const users = await SQL.DB.selectFrom(tableName)
      .selectAll()
      .where('isSignupCompleted', 'is', true)
      .where('isDisabled', 'is', false)
      .execute();

    users.forEach(user => loaders.users.prime(user.id, user));

    return users;
  } catch (err) {
    throw new VisibleError('Failed to get all registered users', { cause: err, isExposable: true });
  }
}

export async function getAll() {
  logger.debug(`${logName} Selecting all users`);

  try {
    const users = await SQL.DB.selectFrom(tableName).selectAll().execute();

    users.forEach(user => loaders.users.prime(user.id, user));

    return users;
  } catch (err) {
    throw new VisibleError('Failed to get all users', { cause: err, isExposable: true });
  }
}

export async function findOneById(userId: string) {
  logger.debug(`${logName} Selecting a user by ID`, { userId });
  return loaders.users.load(userId);
}

export async function findOneByIdOrThrow(userId: string) {
  logger.debug(`${logName} Selecting a user by ID`, { userId });
  const user = await loaders.users.load(userId);
  if (!user) {
    throw new VisibleError('Failed to find user: User does not exist', {
      isExposable: true,
      extraInput: { userId },
    });
  }

  return user;
}

export async function findAllByIdOrThrow(userIds: string[]) {
  logger.debug(`${logName} Selecting multiple users by ID`, { userIds });

  if (!userIds?.length) return [];

  const users = await loaders.users.loadMany(userIds);
  if (!users.length) {
    throw new VisibleError('Failed to find multiple users: Users do not exist', {
      isExposable: true,
      extraInput: { userIds },
    });
  }

  const hasEmptyUser = users.some(user => user === null);
  if (hasEmptyUser) {
    throw new VisibleError('Failed to find multiple users: One or more users are not found', {
      isExposable: true,
      extraInput: { allUserIds: userIds },
    });
  }

  const hasErrorUser = users.some(user => user instanceof Error);
  if (hasErrorUser) {
    throw new VisibleError('Failed to find multiple users: Failed to fetch one or more users ', {
      isExposable: true,
      extraInput: { allUserIds: userIds },
    });
  }

  return users as UserShape[];
}

export async function update(id: string, args: UserUpdateArgs) {
  logger.debug(`${logName} Updating a user`, { id, args });

  if (!Object.keys(args).length) {
    throw new VisibleError('Failed to update user: Update arguments are not provided', {
      isExposable: true,
      extraInput: { id, args },
    });
  }

  const validArgs = { ...args };
  if (args.phone) {
    validArgs.phone = getUnifiedPhoneFormat(args.phone);
  }

  try {
    const user = await SQL.DB.updateTable(tableName)
      .set({ ...validArgs })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    loaders.users.clear(user.id).prime(user.id, user);

    return user;
  } catch (err) {
    if (err instanceof Error && err?.message === 'no result') {
      throw new VisibleError('Failed to update a user: User does not exist!', {
        cause: err,
        isExposable: true,
        extraInput: { id, args },
      });
    }

    throw new VisibleError('Failed to update a user!', { cause: err, isExposable: true, extraInput: { id, args } });
  }
}

export async function updateAsAdminOrThrow(id: string, args: UserUpdateable) {
  logger.debug(`${logName} Updating a user as Admin`, { id, args });

  if (!Object.keys(args).length) {
    throw new VisibleError('Failed to update a user as Admin: Update arguments are not provided', {
      isExposable: true,
      extraInput: { id, args },
    });
  }

  const validArgs = { ...args };
  if (args.phone) {
    validArgs.phone = getUnifiedPhoneFormat(args.phone);
  }

  try {
    const user = await SQL.DB.updateTable(tableName)
      .set({ ...validArgs })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    loaders.users.clear(user.id).prime(user.id, user);

    return user;
  } catch (err) {
    if (err instanceof Error && err?.message === 'no result') {
      throw new VisibleError('Failed to update a user as Admin: User does not exist!', {
        cause: err,
        isExposable: true,
        extraInput: { id, args },
      });
    }

    throw new VisibleError('Failed to update a user as Admin!', {
      cause: err,
      isExposable: true,
      extraInput: { id, args },
    });
  }
}

// This function should be used only by loader
export async function loaderFindAllByIds(ids: readonly string[]) {
  logger.debug(`${logName} Selecting multiple users for loader by IDs`, { ids });

  if (!ids.length) return [];

  try {
    return await SQL.DB.selectFrom(tableName).selectAll().where('id', 'in', ids).orderBy('user.id', 'asc').execute();
  } catch (err) {
    throw new VisibleError('Failed to find users by IDs', { cause: err, isExposable: true, extraInput: { ids } });
  }
}

export * as User from './user.js';
