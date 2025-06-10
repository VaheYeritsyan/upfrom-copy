import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { ExpressionBuilder } from 'kysely';

import { VisibleError, logger } from '@up-from/util';

import { SQL, InsertableType, SelectableType, UpdateableType } from '#sql';
import { UserShape, tableName as userTableName } from '@up-from/repository/user';

export type UserNotificationPrefShape = SelectableType['user_notification_preferences'];

type UserNotificationPrefInsertable = InsertableType['user_notification_preferences'];
export type UserNotificationPrefDraft = Omit<UserNotificationPrefInsertable, 'createdAt' | 'updatedAt' | 'userId'>;

export type UserNotificationPrefUpdateable = UpdateableType['user_notification_preferences'];
export type UserNotificationPrefUpdateArgs = Omit<UserNotificationPrefUpdateable, 'userId' | 'createdAt'>;

export type NotificationRecipient = UserShape & { notificationPreferences: UserNotificationPrefShape | null };

export const tableName = 'user_notification_preferences';

const logName = 'Repository User notification preferences:';

export const defaultPreferences: UserNotificationPrefDraft = {
  pushChatNewMessage: true,
  pushEventNewInvitation: true,
  pushEventNewAllTeam: true,
  pushEventUpdatedDateTime: true,
  pushEventUpdatedLocation: true,
  pushEventCancelled: true,
  pushEventRemovedIndividual: true,
  pushTeamNewMember: false,
  emailChatNewMessage: false,
  emailEventPendingInvitation: true,
};

export const disabledPreferences = makeDisabledNotificationPreferences();

// Disabled notification preferences
function makeDisabledNotificationPreferences() {
  const defaultPreferenceEntries = Object.entries(defaultPreferences);
  const disabledPreferenceEntries = defaultPreferenceEntries.map(([key, value]) => {
    if (typeof value === 'boolean') return [key, false];
    return [key, value];
  });

  return Object.fromEntries(disabledPreferenceEntries);
}

function withNotificationPreferences(eb: ExpressionBuilder<SQL.Database, 'user'>) {
  return jsonObjectFrom(
    eb.selectFrom(tableName).selectAll().whereRef(`${tableName}.userId`, '=', `${userTableName}.id`),
  ).as('notificationPreferences');
}

export async function create(userId: string, notificationPreferencesDraft: UserNotificationPrefDraft) {
  logger.debug(`${logName} Creating user notification preferences`, { notificationPreferencesDraft });

  try {
    const [preferences] = await SQL.DB.insertInto(tableName)
      .values({ ...notificationPreferencesDraft, userId })
      .returningAll()
      .execute();

    return preferences;
  } catch (err) {
    if (err instanceof Error) {
      if (err?.message?.includes('duplicate key value violates unique constraint')) {
        throw new VisibleError('Cannot create user notification preferences. Entry already exists!', {
          cause: err,
          isExposable: false,
          extraInput: { userId, notificationPreferencesDraft },
        });
      }
    }
    throw new VisibleError('Failed to create user notification preferences!', {
      cause: err,
      isExposable: true,
      extraInput: { userId, notificationPreferencesDraft },
    });
  }
}

export async function findOneByUserId(userId: string) {
  logger.debug(`${logName} Selecting user notification preferences by user ID`, { userId });

  try {
    return await SQL.DB.selectFrom(tableName).selectAll().where('userId', '=', userId).executeTakeFirst();
  } catch (err) {
    throw new VisibleError('Failed to find user notification preferences', {
      cause: err,
      isExposable: true,
      extraInput: { userId },
    });
  }
}

export async function findOneByUserIdOrThrow(userId: string) {
  logger.debug(`${logName} Selecting user notification preferences by user ID`, { userId });

  try {
    return await SQL.DB.selectFrom(tableName).selectAll().where('userId', '=', userId).executeTakeFirstOrThrow();
  } catch (err) {
    throw new VisibleError('Failed to find user notification preferences', {
      cause: err,
      isExposable: true,
      extraInput: { userId },
    });
  }
}

export async function update(userId: string, args: UserNotificationPrefUpdateArgs) {
  logger.debug(`${logName} Updating user notification preferences`, { userId, args });

  try {
    return await SQL.DB.updateTable(tableName)
      .set({ ...args })
      .where('userId', '=', userId)
      .returningAll()
      .executeTakeFirstOrThrow();
  } catch (err) {
    if (err instanceof Error && err?.message === 'no result') {
      throw new VisibleError('Failed to update a user: User does not exist!', {
        cause: err,
        isExposable: true,
        extraInput: { userId, args },
      });
    }

    throw new VisibleError('Failed to update user notification settings!', {
      cause: err,
      isExposable: true,
      extraInput: { userId, args },
    });
  }
}

export async function findRecipientsByUserId(
  userIds: string[],
  excludeInvalid = true,
): Promise<NotificationRecipient[]> {
  logger.debug(`${logName} Selecting multiple notification recipients by User ID`, { userIds });

  if (!userIds?.length) return [];

  let recipients: NotificationRecipient[] = [];
  let query = SQL.DB.selectFrom(userTableName)
    .selectAll(userTableName)
    .select(eb => withNotificationPreferences(eb))
    .where('user.id', 'in', userIds);

  if (excludeInvalid) {
    query = query.where('user.isDisabled', 'is', false).where('user.isSignupCompleted', 'is', true);
  }

  try {
    recipients = await query.orderBy('user.id', 'asc').execute();
  } catch (err) {
    throw new VisibleError('Failed to find multiple notification recipients by User ID', {
      cause: err,
      isExposable: true,
      extraInput: { userIds },
    });
  }

  if (!recipients.length) {
    logger.info(`${logName} No valid recipients found`, { invalidRecipients: userIds });
    return recipients;
  }

  // TODO: use next plugin instead once kysely is updated to 0.26.x: https://kysely-org.github.io/kysely-apidoc/classes/ParseJSONResultsPlugin.html
  recipients.forEach(recipient => {
    if (typeof recipient.notificationPreferences === 'string') {
      try {
        recipient.notificationPreferences = JSON.parse(recipient.notificationPreferences);
      } catch (err) {
        new VisibleError('Failed to parse notification preferences for a recipient', {
          isExposable: true,
          extraInput: { recipient },
        });
      }
    }
  });

  return recipients;
}

export * as UserNotificationPref from './user-notification-preferences.js';
