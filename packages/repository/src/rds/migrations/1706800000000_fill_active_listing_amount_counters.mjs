/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  const { countAll } = db.fn;

  const subcategories = await db.selectFrom('subcategory').select('id').execute();

  for (const { id } of subcategories) {
    const activeListingAmount = await db
      .selectFrom('listing')
      .select(countAll().as('total'))
      .where(({ cmpr, selectFrom }) =>
        cmpr('id', 'in', selectFrom('listing_subcategory').select('listingId').where('subcategoryId', '=', id)),
      )
      .where('isDisabled', '=', false)
      .where('isDraft', '=', false)
      .executeTakeFirst();

    await db
      .updateTable('subcategory')
      .set({ activeListingAmount: activeListingAmount.total })
      .where('id', '=', id)
      .execute();
  }

  const categories = await db.selectFrom('category').select('id').execute();

  for (const { id } of categories) {
    const activeListingAmount = await db
      .selectFrom('listing')
      .select(countAll().as('total'))
      .where('categoryId', '=', id)
      .where('isDisabled', '=', false)
      .where('isDraft', '=', false)
      .executeTakeFirst();

    await db
      .updateTable('category')
      .set({ activeListingAmount: activeListingAmount.total })
      .where('id', '=', id)
      .execute();
  }

  const cities = await db.selectFrom('city').select('id').execute();

  for (const { id } of cities) {
    const activeListingAmount = await db
      .selectFrom('listing')
      .select(countAll().as('total'))
      .where('cityId', '=', id)
      .where('isDisabled', '=', false)
      .where('isDraft', '=', false)
      .executeTakeFirst();

    await db.updateTable('city').set({ activeListingAmount: activeListingAmount.total }).where('id', '=', id).execute();
  }
}

/**
 * @param db {Kysely<any>}
 */
export async function down() {}
