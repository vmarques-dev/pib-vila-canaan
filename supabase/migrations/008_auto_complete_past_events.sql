-- =============================================================================
-- Migration 008: Auto-complete events once their date has passed
-- =============================================================================
-- Events were only flagged `concluido = true` when an admin did it by hand.
-- A forgotten event stayed "active" forever, which:
--   - kept it counted as "em aberto" on the dashboard,
--   - let worshipers register for an event that already happened,
--   - made it vanish from the public listing (not "próximo" because the
--     date passed, not "anterior" because it was never marked concluido).
--
-- Rather than spread date-vs-flag logic across every query and component,
-- we keep `concluido` as the single source of truth and make the data
-- correct at the source: a daily pg_cron job marks past events as
-- completed. Every existing query and check that reads `concluido` then
-- behaves correctly with no application changes.
--
-- "Past" = the event's end date (falling back to the start date when there
-- is no end date) is before the current date. Same-day events are only
-- completed the day after they happen, never during the event itself.
--
-- pg_cron must be enabled on the project (Database -> Extensions) before
-- running this migration.
--
-- Trade-off accepted (see PR discussion): the job runs once a day, so a
-- past event is marked complete on the next run rather than instantly, and
-- an admin cannot keep a past event "active" — the next run re-completes
-- it. Both are acceptable for this project.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. One-off backfill — complete every event that is already in the past.
-- -----------------------------------------------------------------------------
UPDATE eventos
SET concluido = true
WHERE concluido = false
  AND COALESCE(data_fim, data_inicio) < CURRENT_DATE;

-- -----------------------------------------------------------------------------
-- 2. Daily scheduled job.
-- -----------------------------------------------------------------------------
-- Runs at 03:00 UTC (00:00 in Brasília, UTC-3) so it sweeps the events that
-- ended the previous day right after midnight local time.
--
-- `cron.schedule` upserts by job name, so re-running this migration just
-- updates the existing schedule instead of creating a duplicate.
-- -----------------------------------------------------------------------------
SELECT cron.schedule(
    'auto-complete-past-events',
    '0 3 * * *',
    $$
        UPDATE eventos
        SET concluido = true
        WHERE concluido = false
          AND COALESCE(data_fim, data_inicio) < CURRENT_DATE;
    $$
);
