/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db
    .updateTable('team')
    .where('imageUrl', 'is', null)
    .set({
      imageUrl:
        'https://prod-up-from-storage-avatarimagesbucket10310826-13i9gxe5pny5v.s3.amazonaws.com/default_image.png',
    })
    .execute();
  await db.schema
    .alterTable('team')
    .alterColumn('imageUrl', col => col.setNotNull())
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema
    .alterTable('team')
    .alterColumn('imageUrl', col => col.dropNotNull())
    .execute();
}
