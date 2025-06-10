/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema.alterTable('user').addColumn('location', 'varchar(1000)').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('user').dropColumn('location').execute();
}
