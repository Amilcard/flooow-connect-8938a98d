-- Vérifier la structure de activity_sessions
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'activity_sessions'
ORDER BY ordinal_position;
