import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .createTable('organization')
    .addColumn('id', 'varchar(26)', col => col.primaryKey().notNull())
    .addColumn('name', 'varchar(128)', col => col.notNull())
    .addColumn('details', 'varchar(1024)', col => col.notNull())
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('organization_name_key', ['name'])
    .execute();

  // Add a default organization for teams that have been already created and have not been referenced to any organization.
  const defaultOrganizationId = '01HB6RDCZYWZFZ26AA7288A51J';
  await db
    .insertInto('organization')
    .values({
      id: defaultOrganizationId,
      name: 'Default Organization',
      details:
        'Default Organization is assigned to all old teams. Old teams were created before app organizations were introduced',
    })
    .execute();

  // Add organizationId column that references to the "Default Organization" by default.
  await db.schema
    .alterTable('team')
    .addColumn('organizationId', 'varchar(26)', col =>
      col
        .references('organization.id')
        .onDelete('cascade')
        .onUpdate('cascade')
        .notNull()
        .defaultTo(defaultOrganizationId),
    )
    .execute();

  // Drops default assignment to the "Default Organization" as all existing teams has been already assigned
  // and new teams must be explicitly referenced to an organization.
  await db.schema
    .alterTable('team')
    .alterColumn('organizationId', col => col.dropDefault())
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('team').dropColumn('organizationId').execute();
  await db.schema.dropTable('organization').execute();
}
