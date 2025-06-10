/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .alterTable('listing')
    .addColumn('isDraft', 'boolean', col => col.notNull().defaultTo(true))
    .execute();
  await db.schema
    .alterTable('listing')
    .addColumn('isCompleted', 'boolean', col => col.notNull().defaultTo(false))
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('listing').dropColumn('isDraft').execute();
  await db.schema.alterTable('listing').dropColumn('isCompleted').execute();
}
