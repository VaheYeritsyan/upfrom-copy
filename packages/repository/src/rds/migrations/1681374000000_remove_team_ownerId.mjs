/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema.alterTable('team').dropColumn('ownerId').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema
    .alterTable('team')
    .addColumn('ownerId', 'varchar(26)', col => col.notNull())
    .execute();
}
