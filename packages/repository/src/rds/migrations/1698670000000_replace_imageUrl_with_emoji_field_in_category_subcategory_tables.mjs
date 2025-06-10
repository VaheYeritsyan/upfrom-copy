/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema.alterTable('category').dropColumn('imageUrl').execute();
  await db.schema.alterTable('subcategory').dropColumn('imageUrl').execute();

  await db.schema.alterTable('category').addColumn('emoji', 'varchar(128)').execute();
  await db.schema.alterTable('subcategory').addColumn('emoji', 'varchar(128)').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('category').addColumn('imageUrl', 'varchar(1024)').execute();
  await db.schema.alterTable('subcategory').addColumn('imageUrl', 'varchar(1024)').execute();

  await db.schema.alterTable('category').dropColumn('emoji').execute();
  await db.schema.alterTable('subcategory').dropColumn('emoji').execute();
}
