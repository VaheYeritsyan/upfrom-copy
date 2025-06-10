/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.updateTable('category').where('emoji', 'is', null).set({ emoji: '' }).execute();
  await db.schema
    .alterTable('category')
    .alterColumn('emoji', col => col.setNotNull())
    .execute();

  await db.updateTable('subcategory').where('emoji', 'is', null).set({ emoji: '' }).execute();
  await db.schema
    .alterTable('subcategory')
    .alterColumn('emoji', col => col.setNotNull())
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema
    .alterTable('category')
    .alterColumn('emoji', col => col.dropNotNull())
    .execute();

  await db.schema
    .alterTable('subcategory')
    .alterColumn('emoji', col => col.dropNotNull())
    .execute();
}
