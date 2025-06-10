import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .createTable('user_device')
    .addColumn('userId', 'varchar(26)', col => col.references('user.id').onDelete('cascade').notNull())
    .addColumn('deviceId', 'varchar(256)', col => col.notNull())
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('user_device_deviceId_key', ['deviceId']) // Each Device ID should be unique
    .execute();

  // To speed up selection by userId
  await db.schema.createIndex('user_device_userId_key').on('user_device').column('userId').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropTable('user_device').execute();
}
