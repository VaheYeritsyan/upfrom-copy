/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema.alterTable('listing').dropConstraint('listing_title_key').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('listing').addUniqueConstraint('listing_title_key', ['title']).execute();
}
