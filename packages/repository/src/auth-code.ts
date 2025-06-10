import { VisibleError, logger } from '@up-from/util';

import { SQL, InsertableType, SelectableType } from '#sql';

export const tableName = 'auth_code';

type CodeType = 'user' | 'manager';

export type AuthCodeShape = SelectableType[typeof tableName];

type AuthCodeInsertable = InsertableType[typeof tableName];
export type AuthCodeDraft = Omit<AuthCodeInsertable, 'createdAt' | 'updatedAt' | 'type'> & { type: CodeType };

const logName = 'Repository Auth Code:';
const codeTtl = 1000 * 60 * 5; // Code time to live - 5 minutes

export type AuthSearchParameters = Pick<AuthCodeInsertable, 'code' | 'email' | 'phone'> & { type: CodeType };

export async function createOne(authCodeDraft: AuthCodeDraft) {
  logger.debug(`${logName} Creating a new auth code record`, { authCodeDraft });

  try {
    // Use transaction to remove stale codes, same phone code, same email code, before adding a new record
    return await SQL.DB.transaction().execute(async transaction => {
      const freshnessLimit = new Date(Date.now() - codeTtl);

      await transaction
        .deleteFrom(tableName)
        .where(({ eb, or, and }) => {
          const deleteConditions = [eb('createdAt', '<', freshnessLimit)]; // Also remove all expired codes

          if (authCodeDraft.phone) {
            deleteConditions.push(and([eb('type', '=', authCodeDraft.type), eb('phone', '=', authCodeDraft.phone)]));
          }
          if (authCodeDraft.email) {
            deleteConditions.push(and([eb('type', '=', authCodeDraft.type), eb('email', '=', authCodeDraft.email)]));
          }

          return or(deleteConditions);
        })
        .execute();

      return await transaction.insertInto(tableName).values(authCodeDraft).returningAll().executeTakeFirstOrThrow();
    });
  } catch (err) {
    throw new VisibleError('Failed to add an auth code record!', {
      cause: err,
      isExposable: true,
      extraInput: { authCodeDraft },
    });
  }
}

export async function takeOne(authCodeSearch: AuthSearchParameters) {
  logger.debug(`${logName} Find an auth code record`, { authCodeSearch });

  try {
    return await SQL.DB.transaction().execute(async transaction => {
      const freshnessLimit = new Date(Date.now() - codeTtl);
      await transaction.deleteFrom(tableName).where('createdAt', '<', freshnessLimit).execute(); // First remove all expired codes

      let selectQuery = transaction
        .selectFrom(tableName)
        .selectAll()
        .where('code', '=', authCodeSearch.code)
        .where('type', '=', authCodeSearch.type);

      if (authCodeSearch.phone) {
        selectQuery = selectQuery.where('phone', '=', authCodeSearch.phone);
      }
      if (authCodeSearch.email) {
        selectQuery = selectQuery.where('email', '=', authCodeSearch.email);
      }

      const authCode = await selectQuery.executeTakeFirst();

      if (authCode) {
        await transaction
          .deleteFrom(tableName)
          .where('code', '=', authCode.code)
          .where('type', '=', authCode.type)
          .where(({ eb, or }) => {
            const deleteConditions = [];
            if (authCode.phone) {
              deleteConditions.push(eb('phone', '=', authCode.phone));
            }
            if (authCode.email) {
              deleteConditions.push(eb('email', '=', authCode.email));
            }
            return or(deleteConditions);
          })
          .execute();
      }

      return authCode;
    });
  } catch (err) {
    throw new VisibleError('Failed to select an auth code record!', {
      cause: err,
      extraInput: { authCodeSearch },
    });
  }
}

export * as AuthCode from './auth-code.js';
