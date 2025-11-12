
-- Migration B.2: Dupliquer les slots de Saint-Étienne vers Paris, Lyon, Marseille, Toulouse

-- Dupliquer les slots vers Paris
INSERT INTO availability_slots (
  activity_id, start, "end", recurrence, seats_total, seats_remaining,
  seats_available, price_override, day_of_week, time_start, time_end,
  start_date, end_date, recurrence_type
)
SELECT 
  new_act.id as activity_id,
  original_slot.start,
  original_slot."end",
  original_slot.recurrence,
  original_slot.seats_total,
  original_slot.seats_remaining,
  original_slot.seats_available,
  original_slot.price_override,
  original_slot.day_of_week,
  original_slot.time_start,
  original_slot.time_end,
  original_slot.start_date,
  original_slot.end_date,
  original_slot.recurrence_type
FROM availability_slots original_slot
INNER JOIN activities original_act ON original_slot.activity_id = original_act.id
INNER JOIN structures original_struct ON original_act.structure_id = original_struct.id
INNER JOIN activities new_act ON new_act.title = original_act.title 
  AND new_act.structure_id IN (SELECT id FROM structures WHERE territory_id = '11111111-1111-1111-1111-111111111111')
WHERE original_struct.territory_id = '0d533821-5995-420c-90c8-aa2a5ba78e93';

-- Dupliquer les slots vers Lyon
INSERT INTO availability_slots (
  activity_id, start, "end", recurrence, seats_total, seats_remaining,
  seats_available, price_override, day_of_week, time_start, time_end,
  start_date, end_date, recurrence_type
)
SELECT 
  new_act.id as activity_id,
  original_slot.start,
  original_slot."end",
  original_slot.recurrence,
  original_slot.seats_total,
  original_slot.seats_remaining,
  original_slot.seats_available,
  original_slot.price_override,
  original_slot.day_of_week,
  original_slot.time_start,
  original_slot.time_end,
  original_slot.start_date,
  original_slot.end_date,
  original_slot.recurrence_type
FROM availability_slots original_slot
INNER JOIN activities original_act ON original_slot.activity_id = original_act.id
INNER JOIN structures original_struct ON original_act.structure_id = original_struct.id
INNER JOIN activities new_act ON new_act.title = original_act.title 
  AND new_act.structure_id IN (SELECT id FROM structures WHERE territory_id = '11111111-1111-1111-1111-111111111112')
WHERE original_struct.territory_id = '0d533821-5995-420c-90c8-aa2a5ba78e93';

-- Dupliquer les slots vers Marseille
INSERT INTO availability_slots (
  activity_id, start, "end", recurrence, seats_total, seats_remaining,
  seats_available, price_override, day_of_week, time_start, time_end,
  start_date, end_date, recurrence_type
)
SELECT 
  new_act.id as activity_id,
  original_slot.start,
  original_slot."end",
  original_slot.recurrence,
  original_slot.seats_total,
  original_slot.seats_remaining,
  original_slot.seats_available,
  original_slot.price_override,
  original_slot.day_of_week,
  original_slot.time_start,
  original_slot.time_end,
  original_slot.start_date,
  original_slot.end_date,
  original_slot.recurrence_type
FROM availability_slots original_slot
INNER JOIN activities original_act ON original_slot.activity_id = original_act.id
INNER JOIN structures original_struct ON original_act.structure_id = original_struct.id
INNER JOIN activities new_act ON new_act.title = original_act.title 
  AND new_act.structure_id IN (SELECT id FROM structures WHERE territory_id = '11111111-1111-1111-1111-111111111113')
WHERE original_struct.territory_id = '0d533821-5995-420c-90c8-aa2a5ba78e93';

-- Dupliquer les slots vers Toulouse
INSERT INTO availability_slots (
  activity_id, start, "end", recurrence, seats_total, seats_remaining,
  seats_available, price_override, day_of_week, time_start, time_end,
  start_date, end_date, recurrence_type
)
SELECT 
  new_act.id as activity_id,
  original_slot.start,
  original_slot."end",
  original_slot.recurrence,
  original_slot.seats_total,
  original_slot.seats_remaining,
  original_slot.seats_available,
  original_slot.price_override,
  original_slot.day_of_week,
  original_slot.time_start,
  original_slot.time_end,
  original_slot.start_date,
  original_slot.end_date,
  original_slot.recurrence_type
FROM availability_slots original_slot
INNER JOIN activities original_act ON original_slot.activity_id = original_act.id
INNER JOIN structures original_struct ON original_act.structure_id = original_struct.id
INNER JOIN activities new_act ON new_act.title = original_act.title 
  AND new_act.structure_id IN (SELECT id FROM structures WHERE territory_id = '11111111-1111-1111-1111-111111111114')
WHERE original_struct.territory_id = '0d533821-5995-420c-90c8-aa2a5ba78e93';
