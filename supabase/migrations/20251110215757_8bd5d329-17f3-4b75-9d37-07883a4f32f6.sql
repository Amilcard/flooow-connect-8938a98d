-- Fonction pour obtenir des événements recommandés basés sur l'historique et les préférences
CREATE OR REPLACE FUNCTION public.get_recommended_events(
  p_user_id uuid,
  p_limit integer DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  event_type text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  location text,
  image_url text,
  external_link text,
  organizer_name text,
  organizer_contact text,
  territory_id uuid,
  territory_name text,
  relevance_score numeric,
  recommendation_reason text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_territory uuid;
  v_favorite_event_types text[];
  v_interested_categories text[];
BEGIN
  -- Récupérer le territoire de l'utilisateur
  SELECT territory_id INTO v_user_territory
  FROM profiles
  WHERE profiles.id = p_user_id;
  
  -- Récupérer les types d'événements favoris de l'utilisateur
  SELECT array_agg(DISTINCT te.event_type) INTO v_favorite_event_types
  FROM favorite_events fe
  JOIN territory_events te ON te.id = fe.event_id
  WHERE fe.user_id = p_user_id;
  
  -- Récupérer les catégories d'intérêt de l'utilisateur
  SELECT interested_categories INTO v_interested_categories
  FROM notification_preferences
  WHERE user_id = p_user_id;
  
  -- Retourner les événements recommandés
  RETURN QUERY
  SELECT 
    te.id,
    te.title,
    te.description,
    te.event_type,
    te.start_date,
    te.end_date,
    te.location,
    te.image_url,
    te.external_link,
    te.organizer_name,
    te.organizer_contact,
    te.territory_id,
    t.name as territory_name,
    -- Score de pertinence (0-100)
    (
      -- 40 points si le type d'événement correspond aux favoris
      CASE WHEN te.event_type = ANY(COALESCE(v_favorite_event_types, ARRAY[]::text[])) THEN 40 ELSE 0 END +
      -- 30 points si l'événement est dans le territoire de l'utilisateur
      CASE WHEN te.territory_id = v_user_territory THEN 30 ELSE 0 END +
      -- 30 points si le type d'événement correspond aux catégories d'intérêt
      CASE WHEN te.event_type = ANY(COALESCE(v_interested_categories, ARRAY[]::text[])) THEN 30 ELSE 0 END
    )::numeric as relevance_score,
    -- Raison de la recommandation
    CASE 
      WHEN te.event_type = ANY(COALESCE(v_favorite_event_types, ARRAY[]::text[])) 
        AND te.territory_id = v_user_territory 
        AND te.event_type = ANY(COALESCE(v_interested_categories, ARRAY[]::text[]))
      THEN 'Correspond à vos favoris, votre territoire et vos centres d''intérêt'
      WHEN te.event_type = ANY(COALESCE(v_favorite_event_types, ARRAY[]::text[])) 
        AND te.territory_id = v_user_territory
      THEN 'Similaire à vos favoris et dans votre territoire'
      WHEN te.event_type = ANY(COALESCE(v_favorite_event_types, ARRAY[]::text[]))
      THEN 'Similaire à vos événements favoris'
      WHEN te.territory_id = v_user_territory
      THEN 'Dans votre territoire'
      WHEN te.event_type = ANY(COALESCE(v_interested_categories, ARRAY[]::text[]))
      THEN 'Correspond à vos centres d''intérêt'
      ELSE 'Recommandé pour vous'
    END as recommendation_reason
  FROM territory_events te
  JOIN territories t ON t.id = te.territory_id
  WHERE te.published = true
    AND te.start_date > NOW()
    -- Exclure les événements déjà en favoris
    AND NOT EXISTS (
      SELECT 1 FROM favorite_events fe2
      WHERE fe2.user_id = p_user_id AND fe2.event_id = te.id
    )
  ORDER BY relevance_score DESC, te.start_date ASC
  LIMIT p_limit;
END;
$$;