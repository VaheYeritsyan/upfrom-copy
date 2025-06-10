import { sql } from 'kysely';
import ulidPackage from './ulid/index.mjs';
const { ulid } = ulidPackage;

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  // Add "credit" type to constraints
  await db.schema.alterTable('account').dropConstraint('account_type_name_check').execute();
  await db.schema
    .alterTable('account')
    .addCheckConstraint('account_type_name_check', sql`type in ('user', 'listing', 'stripe', 'credit')`)
    .execute();

  // Create Credit account to track credit deposits
  await db
    .insertInto('account')
    .values({
      id: ulid(),
      type: 'credit',
    })
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  // Delete credit account
  const creditAccount = await db
    .selectFrom('account')
    .selectAll()
    .where('type', '=', 'credit')
    .executeTakeFirstOrThrow();
  await db.deleteFrom('transaction').where('senderId', '=', creditAccount.id).execute();
  await db.deleteFrom('account').where('type', '=', 'credit').execute();

  // Remove "credit" type from constraints
  await db.schema.alterTable('account').dropConstraint('account_type_name_check').execute();
  await db.schema
    .alterTable('account')
    .addCheckConstraint('account_type_name_check', sql`type in ('user', 'listing', 'stripe')`)
    .execute();
}
