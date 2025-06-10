/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .alterTable('listing')
    .addColumn('isDisabled', 'boolean', col => col.notNull().defaultTo(false))
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('listing').dropColumn('isDisabled').execute();
}
