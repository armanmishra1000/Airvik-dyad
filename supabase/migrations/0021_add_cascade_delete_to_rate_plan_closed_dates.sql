-- Migration: Add ON DELETE CASCADE to rate_plan_closed_dates foreign key
-- This ensures that when a rate_plan_season is deleted, all associated closed dates are automatically removed
-- preventing orphaned records in the database.

-- Drop the existing foreign key constraint (if it exists)
-- Note: The constraint name may vary depending on how Milestone 1 created it
-- Common naming patterns: fk_rate_plan_season_id, rate_plan_closed_dates_rate_plan_season_id_fkey
ALTER TABLE IF EXISTS rate_plan_closed_dates
  DROP CONSTRAINT IF EXISTS rate_plan_closed_dates_rate_plan_season_id_fkey;

ALTER TABLE IF EXISTS rate_plan_closed_dates
  DROP CONSTRAINT IF EXISTS fk_rate_plan_season_id;

-- Recreate the foreign key constraint with ON DELETE CASCADE
ALTER TABLE rate_plan_closed_dates
  ADD CONSTRAINT rate_plan_closed_dates_rate_plan_season_id_fkey
  FOREIGN KEY (rate_plan_season_id)
  REFERENCES rate_plan_seasons(id)
  ON DELETE CASCADE;

-- Add comment explaining the cascade behavior
COMMENT ON CONSTRAINT rate_plan_closed_dates_rate_plan_season_id_fkey 
  ON rate_plan_closed_dates 
  IS 'Automatically delete closed dates when their parent season is deleted';
