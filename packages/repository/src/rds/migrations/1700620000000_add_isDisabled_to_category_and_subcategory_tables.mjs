/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .alterTable('category')
    .addColumn('isDisabled', 'boolean', col => col.notNull().defaultTo(false))
    .execute();

  await db.schema
    .alterTable('subcategory')
    .addColumn('isDisabled', 'boolean', col => col.notNull().defaultTo(false))
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('category').dropColumn('isDisabled').execute();
  await db.schema.alterTable('subcategory').dropColumn('isDisabled').execute();
}
