/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema.alterTable('team').addColumn('imageUrl', 'text').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('team').dropColumn('imageUrl').execute();
}
