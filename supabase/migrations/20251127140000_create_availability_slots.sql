-- Migration : Créer availability_slots et migrer depuis activity_sessions
-- Date : 27/11/2025

-- 1. Créer la table availability_slots
CREATE TABLE IF NOT EXISTS public.availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
    start TIMESTAMPTZ NOT NULL,
    "end" TIMESTAMPTZ NOT NULL,
    seats_total INTEGER DEFAULT 10,
    seats_remaining INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Migrer les données depuis activity_sessions vers availability_slots
INSERT INTO public.availability_slots (
    activity_id,
    start,
    "end",
    seats_total,
    seats_remaining,
    created_at
)
SELECT 
    activity_id,
    -- Construire un timestamp à partir de start_date et start_time
    (start_date::text || ' ' || start_time::text)::timestamptz as start,
    -- Construire un timestamp à partir de start_date et end_time
    (start_date::text || ' ' || end_time::text)::timestamptz as "end",
    COALESCE(max_participants, 10) as seats_total,
    COALESCE(max_participants - COALESCE(current_participants, 0), 10) as seats_remaining,
    created_at
FROM public.activity_sessions
WHERE start_date IS NOT NULL 
  AND start_time IS NOT NULL 
  AND end_time IS NOT NULL;

-- 3. Activer RLS
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

-- 4. Créer une policy pour lecture publique
CREATE POLICY "Public slots are viewable by everyone" 
ON public.availability_slots 
FOR SELECT 
USING (true);

-- 5. Créer des index pour performance
CREATE INDEX IF NOT EXISTS idx_availability_slots_activity_id 
ON public.availability_slots(activity_id);

CREATE INDEX IF NOT EXISTS idx_availability_slots_start 
ON public.availability_slots(start);
