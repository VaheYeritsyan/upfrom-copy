/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .alterTable('listing')
    .alterColumn('description', col => col.dropNotNull())
    .alterColumn('cost', col => col.dropNotNull())
    .alterColumn('currency', col => col.dropNotNull())
    .alterColumn('categoryId', col => col.dropNotNull())
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema
    .alterTable('listing')
    .alterColumn('description', col => col.setNotNull())
    .alterColumn('cost', col => col.setNotNull())
    .alterColumn('currency', col => col.setNotNull())
    .alterColumn('categoryId', col => col.setNotNull())
    .execute();
}
