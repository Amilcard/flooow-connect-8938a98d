-- Add new columns to availability_slots for enhanced slot management
ALTER TABLE availability_slots 
  ADD COLUMN IF NOT EXISTS seats_available INTEGER DEFAULT 20,
  ADD COLUMN IF NOT EXISTS price_override DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  ADD COLUMN IF NOT EXISTS time_start TIME,
  ADD COLUMN IF NOT EXISTS time_end TIME,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS recurrence_type TEXT CHECK (recurrence_type IN ('WEEKLY', 'DAILY', 'MONTHLY', 'ONCE'));

COMMENT ON COLUMN availability_slots.day_of_week IS 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday';
COMMENT ON COLUMN availability_slots.seats_available IS 'Total seats available for this slot';
COMMENT ON COLUMN availability_slots.price_override IS 'Optional price override for this specific slot';
COMMENT ON COLUMN availability_slots.recurrence_type IS 'Type of recurrence: WEEKLY, DAILY, MONTHLY, or ONCE';