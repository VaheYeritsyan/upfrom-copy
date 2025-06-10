/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  // Organization ID
  await db.schema
    .alterTable('listing')
    .addColumn('organizationId', 'varchar(26)', col =>
      col.references('organization.id').onDelete('restrict').onUpdate('cascade'),
    )
    .execute();

  const defaultOrganizationId = '01HB6RDCZYWZFZ26AA7288A51J';
  const defaultOrganization = await db
    .selectFrom('organization')
    .selectAll()
    .where('id', '=', defaultOrganizationId)
    .executeTakeFirstOrThrow();

  await db
    .updateTable('listing')
    .set({ organizationId: defaultOrganization.id })
    .where('isDraft', '=', false)
    .execute();

  // Owner ID
  await db.schema
    .alterTable('listing')
    .addColumn('ownerId', 'varchar(26)', col => col.references('user.id').onDelete('restrict').onUpdate('cascade'))
    .execute();

  // Trying to find Joe and set him as default owner for all old listings
  let defaultOwner = await db
    .selectFrom('user')
    .selectAll()
    .where('email', 'in', ['joepaulreed@gmail.com', 'joe@exponentgroup.org'])
    .executeTakeFirst();

  // No Joe's user found, so trying to get the oldest user instead
  if (!defaultOwner) {
    defaultOwner = await db.selectFrom('user').selectAll().orderBy('user.id', 'asc').executeTakeFirst();
  }

  // Update listing owners only if there any user exist
  if (defaultOwner) {
    await db.updateTable('listing').set({ ownerId: defaultOwner.id }).execute();
  }

  await db.schema
    .alterTable('listing')
    .alterColumn('ownerId', col => col.setNotNull())
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('listing').dropColumn('organizationId').execute();
  await db.schema.alterTable('listing').dropColumn('ownerId').execute();
}
