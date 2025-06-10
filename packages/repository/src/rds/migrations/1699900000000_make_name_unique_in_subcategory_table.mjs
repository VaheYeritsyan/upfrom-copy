/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema.alterTable('subcategory').dropConstraint('subcategory_name_categoryId_key').execute();
  await db.schema.alterTable('subcategory').addUniqueConstraint('subcategory_name_key', ['name']).execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('subcategory').dropConstraint('subcategory_name_key').execute();
  await db.schema
    .alterTable('subcategory')
    .addUniqueConstraint('subcategory_name_categoryId_key', ['name', 'categoryId'])
    .execute();
}
