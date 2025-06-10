/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema.alterTable('event').addColumn('address', 'text').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('event').dropColumn('address').execute();
}
