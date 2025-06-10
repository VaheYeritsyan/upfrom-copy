/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .alterTable('admin')
    .addColumn('isDisabled', 'boolean', col => col.notNull().defaultTo(false))
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('admin').dropColumn('isDisabled').execute();
}
