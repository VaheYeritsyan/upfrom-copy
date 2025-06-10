/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema.createIndex('transaction_recipientId_index').on('transaction').columns(['recipientId']).execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropIndex('transaction_recipientId_index').execute();
}
