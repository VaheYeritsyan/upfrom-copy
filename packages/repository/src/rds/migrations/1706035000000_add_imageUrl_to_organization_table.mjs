/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema.alterTable('organization').addColumn('imageUrl', 'varchar(1024)').execute();

  const defaultImageUrl =
    'https://prod-up-from-storage-avatarimagesbucket10310826-13i9gxe5pny5v.s3.amazonaws.com/default_image.png';

  await db.updateTable('organization').set({ imageUrl: defaultImageUrl }).execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('organization').dropColumn('imageUrl').execute();
}
