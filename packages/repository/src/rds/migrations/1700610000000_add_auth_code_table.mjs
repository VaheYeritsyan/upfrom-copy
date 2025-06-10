import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .createTable('auth_code')
    .addColumn('code', 'varchar(6)', col => col.notNull())
    .addColumn('phone', 'varchar(32)')
    .addColumn('email', 'text')
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema.createIndex('auth_code_phone_code_index').on('auth_code').columns(['phone', 'code']).execute();
  await db.schema.createIndex('auth_code_email_code_index').on('auth_code').columns(['email', 'code']).execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropTable('auth_code').execute();
}
