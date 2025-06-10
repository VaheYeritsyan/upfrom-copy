import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .alterTable('auth_code')
    .addColumn('type', 'varchar(64)', col => col.notNull().defaultTo('user'))
    .execute();

  await db.schema
    .alterTable('auth_code')
    .addCheckConstraint('auth_code_type_name_check', sql`type in ('user', 'manager')`)
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('auth_code').dropConstraint('auth_code_type_name_check').execute();
  await db.schema.alterTable('auth_code').dropColumn('type').execute();
}
