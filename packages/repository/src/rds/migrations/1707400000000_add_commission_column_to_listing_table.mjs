/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .alterTable('listing')
    .addColumn('commissionPercent', 'numeric(5,2)', col => col.notNull().defaultTo(0))
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('listing').dropColumn('commissionPercent').execute();
}
