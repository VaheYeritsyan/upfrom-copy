import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .createTable('city')
    .addColumn('id', 'varchar(26)', col => col.primaryKey().notNull())
    .addColumn('name', 'varchar(256)', col => col.notNull())
    .addColumn('state', 'varchar(128)', col => col.notNull())
    .addColumn('imageUrl', 'varchar(1024)')
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('city_name_state_key', ['name', 'state'])
    .execute();

  await db.schema
    .createTable('category')
    .addColumn('id', 'varchar(26)', col => col.primaryKey().notNull())
    .addColumn('name', 'varchar(128)', col => col.notNull())
    .addColumn('imageUrl', 'varchar(1024)')
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('category_name_key', ['name'])
    .execute();

  await db.schema
    .createTable('subcategory')
    .addColumn('id', 'varchar(26)', col => col.primaryKey().notNull())
    .addColumn('name', 'varchar(128)', col => col.notNull())
    .addColumn('imageUrl', 'varchar(1024)')
    .addColumn('categoryId', 'varchar(26)', col =>
      col.references('category.id').onDelete('restrict').onUpdate('cascade').notNull(),
    )
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('subcategory_name_categoryId_key', ['name', 'categoryId'])
    .execute();

  await db.schema
    .createTable('listing')
    .addColumn('id', 'varchar(26)', col => col.primaryKey().notNull())
    .addColumn('title', 'varchar(1024)', col => col.notNull())
    .addColumn('description', 'varchar(2048)', col => col.notNull())
    .addColumn('imageUrl', 'varchar(1024)')
    .addColumn('cost', 'varchar(128)', col => col.notNull())
    .addColumn('currency', 'varchar(32)', col => col.notNull())
    .addColumn('location', 'varchar(1000)')
    .addColumn('categoryId', 'varchar(26)', col =>
      col.references('category.id').onDelete('restrict').onUpdate('cascade').notNull(),
    )
    .addColumn('subcategoryId', 'varchar(26)', col =>
      col.references('subcategory.id').onDelete('restrict').onUpdate('cascade').notNull(),
    )
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('listing_title_key', ['title'])
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropTable('listing').execute();
  await db.schema.dropTable('subcategory').execute();
  await db.schema.dropTable('category').execute();
  await db.schema.dropTable('city').execute();
}
