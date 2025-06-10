import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .alterTable('team')
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .alterTable('team')
    .addColumn('ownerId', 'varchar(26)', col => col.notNull())
    .execute();

  await db.schema
    .alterTable('team')
    .addColumn('description', 'text', col => col.notNull())
    .execute();

  await db.schema.alterTable('team').addColumn('location', 'varchar(255)').execute();

  await db.schema
    .alterTable('team')
    .alterColumn('id', col => col.setDataType('varchar(26)')) // ULID is 26 symbols long
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema
    .alterTable('team')
    .alterColumn('id', col => col.setDataType('varchar(64)'))
    .execute();

  await db.schema.alterTable('team').dropColumn('description').execute();
  await db.schema.alterTable('team').dropColumn('location').execute();
  await db.schema.alterTable('team').dropColumn('ownerId').execute();
  await db.schema.alterTable('team').dropColumn('updatedAt').execute();
}
