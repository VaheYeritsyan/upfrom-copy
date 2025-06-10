/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .alterTable('user')
    .addColumn('isDisabled', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('isSignupCompleted', 'boolean', col => col.notNull().defaultTo(false))
    .execute();

  // Set 'isSignupCompleted' to 'true' for all users that have first name
  await db.updateTable('user').set({ isSignupCompleted: true }).where('firstName', 'is not', null).execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('user').dropColumn('isDisabled').execute();
  await db.schema.alterTable('user').dropColumn('isSignupCompleted').execute();
}
