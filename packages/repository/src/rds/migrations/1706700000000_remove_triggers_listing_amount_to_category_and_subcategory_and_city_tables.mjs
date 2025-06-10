import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await sql`
  DROP TRIGGER IF EXISTS update_listing_subcategory_counters ON listing_subcategory;
  DROP TRIGGER IF EXISTS update_listing_counters_on_listing_delete ON listing;
  DROP TRIGGER IF EXISTS update_listing_counters_on_listing_update ON listing;
  DROP TRIGGER IF EXISTS update_listing_counters_on_listing_insert ON listing;

  DROP FUNCTION IF EXISTS update_listing_subcategory_counters;
  DROP FUNCTION IF EXISTS update_listing_counters_on_listing_delete;
  DROP FUNCTION IF EXISTS update_listing_counters_on_listing_update;
  DROP FUNCTION IF EXISTS update_listing_counters_on_listing_insert;

  DROP PROCEDURE IF EXISTS update_city_listing_counter;
  DROP PROCEDURE IF EXISTS update_category_listing_counter;
  DROP PROCEDURE IF EXISTS update_subcategory_listing_counters;
  `.execute(db.withSchema(db.schema));
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  // Functions and triggers that update:
  // - City listing counters on listing insert/update/delete.
  // - Category listing counters on listing insert/update/delete.
  // - Subcategory listing counters on listing update when listing becomes disabled, enabled, published, unpublished.
  // - Subcategory listing counters when the list of listing subcategories is updated (insert/delete on listing_subcategory).
  await sql`
  --
  -- City counter update procedure
  --
  CREATE OR REPLACE PROCEDURE update_city_listing_counter(city_id text)
  LANGUAGE plpgsql
  AS $$
    BEGIN
      UPDATE
        city
      SET
        "updatedAt" = now(), "activeListingAmount" = (SELECT COUNT(*) FROM listing WHERE "cityId" = city_id AND "isDraft" = false AND "isDisabled" = false)
      WHERE
        id = city_id;
    END;
  $$;

  --
  -- Category counter update procedure
  --
  CREATE OR REPLACE PROCEDURE update_category_listing_counter(category_id text)
  LANGUAGE plpgsql
  AS $$
    BEGIN
      UPDATE
        category
      SET
        "updatedAt" = now(), "activeListingAmount" = (SELECT COUNT(*) FROM listing WHERE "categoryId" = category_id AND "isDraft" = false AND "isDisabled" = false)
      WHERE
        id = category_id;
    END;
  $$;

  --
  -- Subcategory counters update procedure
  --
  CREATE OR REPLACE PROCEDURE update_subcategory_listing_counters(subcategory_ids text[])
  LANGUAGE plpgsql
  AS $$
    BEGIN
      UPDATE
        subcategory
      SET
        "updatedAt" = now(),
        "activeListingAmount" = (
          SELECT
            COUNT(*)
          FROM
            -- Joining listing table to exclude draft or disabled listings from counting
            listing_subcategory JOIN listing ON "listingId" = listing.id
          WHERE
            "subcategoryId" = subcategory.id AND listing."isDraft" = false AND listing."isDisabled" = false
        )
      WHERE
        id = ANY(subcategory_ids);
    END;
  $$;

  --
  -- Update listing counters on listing insert
  --
  CREATE OR REPLACE FUNCTION update_listing_counters_on_listing_insert() RETURNS TRIGGER AS $$
    BEGIN
      -- Update counters only on listing insert.
      IF (TG_OP != 'INSERT') THEN
        RETURN NULL;
      END IF;

      -- Skip counter updates when new listing is disabled or draft.
      IF (NEW."isDraft" = true OR NEW."isDisabled" = true) THEN
        RETURN NULL;
      END IF;

      IF (NEW."cityId" IS NOT NULL) THEN
        CALL update_city_listing_counter(NEW."cityId");
      END IF;

      IF (NEW."categoryId" IS NOT NULL) THEN
        CALL update_category_listing_counter(NEW."categoryId");
      END IF;
      -- Do not update subcategory counters. There is update_listing_subcategory_counters function for listing_subcategory table that updates counters when list of listing subcategories is updated

      RETURN NULL;
    END;
  $$ LANGUAGE plpgsql;

  --
  -- Update listing counters on listing update
  --
  CREATE OR REPLACE FUNCTION update_listing_counters_on_listing_update() RETURNS TRIGGER AS $$
    DECLARE
      listing_subcategories text[] = ARRAY[]::text[];
    BEGIN
      -- Update counters only on listing update.
      IF (TG_OP != 'UPDATE') THEN
        RETURN NULL;
      END IF;

      -- Skip counter updates when this listing is still disabled or draft.
      IF ((OLD."isDraft" = true AND NEW."isDraft" = true) OR (OLD."isDisabled" = true AND NEW."isDisabled" = true)) THEN
        RETURN NULL;
      END IF;

      -- Update city counters when the listing city ID changes, or when this listing is being published, unpublished, activated, or deactivated.
      IF (OLD."cityId" != NEW."cityId" OR OLD."isDraft" != NEW."isDraft" OR OLD."isDisabled" != NEW."isDisabled") THEN
        IF (NEW."cityId" IS NOT NULL) THEN
          CALL update_city_listing_counter(NEW."cityId");
        END IF;

        IF (OLD."cityId" IS NOT NULL AND OLD."cityId" != NEW."cityId") THEN
          CALL update_city_listing_counter(OLD."cityId");
        END IF;
      END IF;

      -- Update category counters when the listing category ID changes, or when this listing is being published, unpublished, activated, or deactivated.
      IF (OLD."categoryId" != NEW."categoryId" OR OLD."isDraft" != NEW."isDraft" OR OLD."isDisabled" != NEW."isDisabled") THEN
        IF (NEW."categoryId" IS NOT NULL) THEN
          CALL update_category_listing_counter(NEW."categoryId");
        END IF;

        IF (OLD."categoryId" IS NOT NULL AND OLD."categoryId" != NEW."categoryId") THEN
          CALL update_category_listing_counter(OLD."categoryId");
        END IF;
      END IF;

      -- Update each subcategory counter of the listing subcategories when the listing is being published, unpublished, activated, or deactivated.
      IF (OLD."isDisabled" != NEW."isDisabled" OR OLD."isDraft" != NEW."isDraft") THEN
        listing_subcategories = (SELECT array_agg("subcategoryId") FROM listing_subcategory WHERE "listingId" = NEW.id);
        CALL update_subcategory_listing_counters(listing_subcategories);
      END IF;
      -- There is update_listing_subcategory_counters function for listing_subcategory table that updates counters when list of listing subcategories is updated

      RETURN NULL;
    END;
  $$ LANGUAGE plpgsql;

  --
  -- Update listing counters on listing delete
  --
  CREATE OR REPLACE FUNCTION update_listing_counters_on_listing_delete() RETURNS TRIGGER AS $$
    BEGIN
      -- Update counters only on listing delete.
      IF (TG_OP != 'DELETE') THEN
        RETURN NULL;
      END IF;

      -- Skip counter updates when the listing is disabled or draft.
      IF (OLD."isDraft" = true OR OLD."isDisabled" = true) THEN
        RETURN NULL;
      END IF;

      IF (OLD."cityId" IS NOT NULL) THEN
        CALL update_city_listing_counter(OLD."cityId");
      END IF;

      IF (OLD."categoryId" IS NOT NULL) THEN
        CALL update_category_listing_counter(OLD."categoryId");
      END IF;
      -- Do not update subcategory counters. There is update_listing_subcategory_counters function for listing_subcategory table that updates counters when list of listing subcategories is updated

      RETURN NULL;
    END;
  $$ LANGUAGE plpgsql;

  --
  -- Update listing subcategory counters on listing_subcategory insert or delete
  --
  CREATE OR REPLACE FUNCTION update_listing_subcategory_counters() RETURNS TRIGGER AS $$
    BEGIN
      IF (TG_OP = 'INSERT' AND NEW."subcategoryId" IS NOT NULL) THEN
        CALL update_subcategory_listing_counters(ARRAY[NEW."subcategoryId"]);
      END IF;

      IF (TG_OP = 'DELETE' AND OLD."subcategoryId" IS NOT NULL) THEN
        CALL update_subcategory_listing_counters(ARRAY[OLD."subcategoryId"]);
      END IF;

      RETURN NULL;
    END;
  $$ LANGUAGE plpgsql;

  --
  -- Function triggers
  --
  CREATE TRIGGER update_listing_counters_on_listing_insert
  AFTER INSERT ON listing
    FOR EACH ROW EXECUTE FUNCTION update_listing_counters_on_listing_insert();

  CREATE TRIGGER update_listing_counters_on_listing_update
  AFTER UPDATE ON listing
    FOR EACH ROW EXECUTE FUNCTION update_listing_counters_on_listing_update();

  CREATE TRIGGER update_listing_counters_on_listing_delete
  AFTER DELETE ON listing
    FOR EACH ROW EXECUTE FUNCTION update_listing_counters_on_listing_delete();

  CREATE TRIGGER update_listing_subcategory_counters
  AFTER INSERT OR DELETE ON listing_subcategory
    FOR EACH ROW EXECUTE FUNCTION update_listing_subcategory_counters();
  `.execute(db.withSchema(db.schema));

  // Update all city counters
  await sql`
  DO LANGUAGE plpgsql $$
    DECLARE
      city city%ROWTYPE;
    BEGIN
      FOR city IN
        SELECT id FROM city
      LOOP
        CALL update_city_listing_counter(city.id);
      END LOOP;
    END;
  $$;
  `.execute(db.withSchema(db.schema));

  // Update all category counters
  await sql`
  DO LANGUAGE plpgsql $$
    DECLARE
      category category%ROWTYPE;
    BEGIN
      FOR category IN
        SELECT id FROM category
      LOOP
        CALL update_category_listing_counter(category.id);
      END LOOP;
    END;
  $$;
  `.execute(db.withSchema(db.schema));

  // Update all subcategory counters
  await sql`
  DO LANGUAGE plpgsql $$
    DECLARE
      subcategory_ids text[] = ARRAY[]::text[];
    BEGIN
      subcategory_ids = (SELECT array_agg(id) FROM subcategory);
      CALL update_subcategory_listing_counters(subcategory_ids);
    END;
  $$;
  `.execute(db.withSchema(db.schema));
}
