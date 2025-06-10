/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema.alterTable('user').addColumn('avatarUrl', 'text').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('user').dropColumn('avatarUrl').execute();
}
