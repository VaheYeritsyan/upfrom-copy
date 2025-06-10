/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema.alterTable('team').dropColumn('location').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('team').addColumn('location', 'varchar(255)').execute();
}
