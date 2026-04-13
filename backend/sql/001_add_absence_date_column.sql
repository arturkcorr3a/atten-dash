-- Migration: Add absence_date column to absences table
-- Description: Adds a date column to track when each absence occurred
-- This allows storing specific dates for absences, enhancing the academic tracking feature

ALTER TABLE absences
ADD COLUMN absence_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Create an index on absence_date for efficient filtering
CREATE INDEX idx_absences_absence_date ON absences(absence_date);

-- Create a composite index for user_id and absence_date filtering
CREATE INDEX idx_absences_user_absence_date ON absences(user_id, absence_date);
