/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema.alterTable('team').dropColumn('disabledUserIds').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('team').addColumn('disabledUserIds', 'varchar(26)[]').execute();
}
