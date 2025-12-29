# Configuration des rappels automatiques d'événements

## Vue d'ensemble

Le système de rappels automatiques envoie des notifications in-app et/ou par email aux utilisateurs pour leurs événements favoris, X jours avant qu'ils ne commencent (configurable par l'utilisateur).

## Composants implémentés

### 1. Base de données

- **Table `notification_preferences`** : Stocke les préférences de notification des utilisateurs
  - `event_reminders_enabled` : Activer/désactiver les rappels
  - `event_reminder_days_before` : Nombre de jours avant l'événement (1, 2, 3, 5 ou 7)
  - `event_reminder_email` : Envoyer aussi par email

- **Table `event_reminders_sent`** : Trace les rappels déjà envoyés pour éviter les duplicatas
  - Unique sur (user_id, event_id, reminder_type, days_before)

### 2. Edge Function

**Fonction** : `supabase/functions/event-reminders/index.ts`

Cette fonction :
1. Récupère tous les utilisateurs avec les rappels activés
2. Pour chaque utilisateur, trouve ses événements favoris
3. Vérifie si un événement commence dans X jours (selon la préférence)
4. Crée une notification in-app
5. Envoie un email si l'utilisateur l'a activé
6. Enregistre le rappel comme envoyé pour éviter les duplicatas

### 3. Interface utilisateur

**Page** : `src/pages/account/MesNotifications.tsx`

Dans l'onglet "Préférences", une nouvelle section "Rappels d'événements favoris" permet de :
- Activer/désactiver les rappels
- Choisir le nombre de jours avant l'événement (1-7 jours)
- Activer/désactiver les emails de rappel

## Configuration du Cron Job

Pour que les rappels soient envoyés automatiquement, vous devez configurer un cron job qui appelle l'edge function régulièrement.

### Option 1 : Via pg_cron (Recommandé)

1. Activer l'extension `pg_cron` dans votre projet Supabase :
   - Allez dans Database > Extensions
   - Activez `pg_cron` et `pg_net`

2. Exécutez cette requête SQL dans l'éditeur SQL :

```sql
-- Planifier l'exécution tous les jours à 8h00 UTC
-- IMPORTANT: Remplacez YOUR_SUPABASE_URL et YOUR_ANON_KEY par vos valeurs depuis le dashboard Supabase
SELECT cron.schedule(
  'event-reminders-daily',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/event-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY"}'::jsonb,
        body:=jsonb_build_object('time', NOW())
    ) as request_id;
  $$
);
```

3. Vérifier que le cron job est bien configuré :

```sql
SELECT * FROM cron.job;
```

### Option 2 : Service externe (GitHub Actions, etc.)

Créer un workflow GitHub Actions qui appelle l'edge function :

```yaml
name: Event Reminders
on:
  schedule:
    - cron: '0 8 * * *'  # Tous les jours à 8h00 UTC
  workflow_dispatch:  # Permet l'exécution manuelle

jobs:
  trigger-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Call event reminders function
        run: |
          curl -X POST \
            ${{ secrets.SUPABASE_URL }}/functions/v1/event-reminders \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -d '{"time": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}'
```

### Option 3 : Service de cron externe

Utilisez un service comme cron-job.org ou EasyCron pour appeler l'URL de l'edge function :

**URL** : `https://YOUR_PROJECT_REF.supabase.co/functions/v1/event-reminders`

**Méthode** : POST

**Headers** :
- `Content-Type: application/json`
- `Authorization: Bearer YOUR_SUPABASE_ANON_KEY` (depuis Settings > API dans le dashboard Supabase)

**Body** : `{"time": "2025-01-10T08:00:00Z"}`

## Test manuel

Pour tester la fonction manuellement, vous pouvez l'appeler via curl :

```bash
# Remplacez YOUR_PROJECT_REF et YOUR_SUPABASE_ANON_KEY par vos valeurs
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/event-reminders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{"time": "2025-01-10T08:00:00Z"}'
```

Ou depuis la console Supabase : Functions > event-reminders > Invoke function

## Configuration des emails

Les emails sont envoyés via Resend. Assurez-vous que :
1. La clé API Resend (`RESEND_API_KEY`) est configurée dans les secrets
2. Le domaine d'envoi est vérifié sur Resend : https://resend.com/domains
3. Remplacez `onboarding@resend.dev` par votre domaine vérifié dans le code de l'edge function

## Monitoring

Pour surveiller les rappels envoyés :

```sql
-- Voir les rappels envoyés aujourd'hui
SELECT 
  ers.*,
  p.email,
  te.title as event_title
FROM event_reminders_sent ers
JOIN profiles p ON ers.user_id = p.id
JOIN territory_events te ON ers.event_id = te.id
WHERE ers.sent_at::date = CURRENT_DATE
ORDER BY ers.sent_at DESC;

-- Statistiques des rappels
SELECT 
  reminder_type,
  COUNT(*) as total_sent,
  COUNT(DISTINCT user_id) as unique_users
FROM event_reminders_sent
WHERE sent_at > NOW() - INTERVAL '7 days'
GROUP BY reminder_type;
```

## Troubleshooting

### Les rappels ne sont pas envoyés

1. Vérifier que le cron job est actif :
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'event-reminders-daily';
   ```

2. Vérifier les logs de l'edge function dans Supabase Dashboard

3. Vérifier que des utilisateurs ont des événements favoris qui commencent bientôt :
   ```sql
   SELECT 
     u.email,
     te.title,
     te.start_date,
     np.event_reminder_days_before
   FROM favorite_events fe
   JOIN profiles u ON fe.user_id = u.id
   JOIN territory_events te ON fe.event_id = te.id
   JOIN notification_preferences np ON u.id = np.user_id
   WHERE np.event_reminders_enabled = true
     AND te.start_date > NOW()
     AND te.start_date < NOW() + INTERVAL '7 days';
   ```

### Les emails ne sont pas reçus

1. Vérifier que le domaine est vérifié sur Resend
2. Vérifier les logs Resend : https://resend.com/emails
3. Vérifier que l'utilisateur a activé `event_reminder_email` dans ses préférences
