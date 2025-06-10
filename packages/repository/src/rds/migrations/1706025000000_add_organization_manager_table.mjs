import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .createTable('organization_manager')
    .addColumn('userId', 'varchar(26)', col =>
      col.references('user.id').onDelete('restrict').onUpdate('cascade').notNull(),
    )
    .addColumn('organizationId', 'varchar(26)', col =>
      col.references('organization.id').onDelete('restrict').onUpdate('cascade').notNull(),
    )
    .addColumn('assignedBy', 'varchar(26)', col => col.references('user.id').onDelete('restrict').onUpdate('cascade'))
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('organization_manager_userId_organizationId_key', ['userId', 'organizationId'])
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropTable('organization_manager').execute();
}
