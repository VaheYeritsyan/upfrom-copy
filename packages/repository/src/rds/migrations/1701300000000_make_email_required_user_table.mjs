/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .alterTable('user')
    .alterColumn('email', col => col.setNotNull())
    .execute();

  await db.schema
    .alterTable('user')
    .alterColumn('phone', col => col.dropNotNull())
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema
    .alterTable('user')
    .alterColumn('email', col => col.dropNotNull())
    .execute();

  await db.schema
    .alterTable('user')
    .alterColumn('phone', col => col.setNotNull())
    .execute();
}
