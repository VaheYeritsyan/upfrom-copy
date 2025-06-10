/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema.alterTable('user').addColumn('firstName', 'text').execute();
  await db.schema.alterTable('user').addColumn('lastName', 'text').execute();
  await db.schema.alterTable('user').dropColumn('name').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('user').addColumn('name', 'text').execute();
  await db.schema.alterTable('user').dropColumn('firstName').execute();
  await db.schema.alterTable('user').dropColumn('lastName').execute();
}
