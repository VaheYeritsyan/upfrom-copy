/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .alterTable('organization')
    .addColumn('activeListingAmount', 'integer', col => col.notNull().defaultTo(0))
    .execute();

  const { countAll } = db.fn;

  // set activeListingAmount for all organization
  const organizations = await db.selectFrom('organization').select('id').execute();
  for (const { id } of organizations) {
    const activeListingAmount = await db
      .selectFrom('listing')
      .select(countAll().as('total'))
      .where('organizationId', '=', id)
      .where('isDisabled', '=', false)
      .where('isDraft', '=', false)
      .executeTakeFirst();

    await db
      .updateTable('organization')
      .set({ activeListingAmount: activeListingAmount.total })
      .where('id', '=', id)
      .execute();
  }
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('organization').dropColumn('activeListingAmount').execute();
}
