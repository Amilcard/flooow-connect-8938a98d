# Proposition de schéma : Table `eco_travel_logs`

## Objectif

Permettre le cumul des économies de CO2 pour les utilisateurs connectés qui valident leurs trajets éco-responsables via le CTA "J'ai réalisé ce trajet".

## Schéma proposé

```sql
-- Table pour enregistrer les trajets éco-responsables validés par les utilisateurs
CREATE TABLE eco_travel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,

  -- Données du trajet
  transport_mode TEXT NOT NULL CHECK (transport_mode IN ('walk', 'bike', 'bus', 'carpool')),
  distance_meters INTEGER NOT NULL CHECK (distance_meters > 0),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),

  -- Calculs d'impact
  co2_saved_grams INTEGER NOT NULL CHECK (co2_saved_grams >= 0), -- CO2 évités vs voiture
  calories_burned INTEGER, -- Optionnel: calories brûlées (marche/vélo)
  steps_count INTEGER, -- Optionnel: nombre de pas (marche)

  -- Adresses (pour référence)
  departure_address TEXT,
  arrival_address TEXT,

  -- Métadonnées
  validated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_eco_travel_logs_user_id ON eco_travel_logs(user_id);
CREATE INDEX idx_eco_travel_logs_validated_at ON eco_travel_logs(validated_at);
CREATE INDEX idx_eco_travel_logs_transport_mode ON eco_travel_logs(transport_mode);

-- RLS (Row Level Security)
ALTER TABLE eco_travel_logs ENABLE ROW LEVEL SECURITY;

-- Politique: les utilisateurs ne voient que leurs propres logs
CREATE POLICY "Users can view own travel logs" ON eco_travel_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own travel logs" ON eco_travel_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pas de UPDATE/DELETE pour préserver l'intégrité des données
```

## Constantes de calcul utilisées

| Paramètre | Valeur | Source |
|-----------|--------|--------|
| CO2 voiture | 120 g/km | ADEME moyenne véhicule particulier |
| Calories marche | 4-5 kcal/min | Estimation standard |
| Calories vélo | 7-8 kcal/min | Estimation standard |
| Pas par km | 1300-1400 | Moyenne adulte |

## Exemple d'utilisation

```typescript
// Insertion d'un trajet validé
const logTrip = async (userId: string, tripData: {
  activityId: string;
  transportMode: 'walk' | 'bike' | 'bus';
  distanceMeters: number;
  durationSeconds: number;
}) => {
  const co2SavedGrams = Math.round(tripData.distanceMeters / 1000 * 120);

  const { error } = await supabase.from('eco_travel_logs').insert({
    user_id: userId,
    activity_id: tripData.activityId,
    transport_mode: tripData.transportMode,
    distance_meters: tripData.distanceMeters,
    duration_seconds: tripData.durationSeconds,
    co2_saved_grams: co2SavedGrams,
    calories_burned: tripData.transportMode === 'walk'
      ? Math.round(tripData.durationSeconds / 60 * 5)
      : tripData.transportMode === 'bike'
        ? Math.round(tripData.durationSeconds / 60 * 8)
        : null,
    steps_count: tripData.transportMode === 'walk'
      ? Math.round(tripData.distanceMeters / 1000 * 1350)
      : null
  });

  return { error };
};

// Récupérer le cumul d'un utilisateur
const getUserEcoStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('eco_travel_logs')
    .select('co2_saved_grams, transport_mode')
    .eq('user_id', userId);

  if (error || !data) return null;

  return {
    totalCo2SavedKg: data.reduce((sum, log) => sum + log.co2_saved_grams, 0) / 1000,
    totalTrips: data.length,
    tripsByMode: {
      walk: data.filter(l => l.transport_mode === 'walk').length,
      bike: data.filter(l => l.transport_mode === 'bike').length,
      bus: data.filter(l => l.transport_mode === 'bus').length
    }
  };
};
```

## Paliers de gamification proposés

| Palier | Critère | Badge | Message |
|--------|---------|-------|---------|
| Débutant éco | 1er trajet validé | 🌱 | "Premier pas vers l'éco-mobilité !" |
| Éco-citoyen | 5 trajets | 🚶 | "5 trajets éco-responsables, bravo !" |
| Champion vert | 10 trajets | 🚴 | "10 trajets ! Vous êtes un exemple !" |
| Héros du climat | 20 trajets OU 10 kg CO2 | 🏆 | "Héros du climat ! Vous inspirez les autres." |
| Légende verte | 50 trajets OU 25 kg CO2 | 🌍 | "Légende verte ! Impact majeur sur la planète." |

## Alternative sans nouvelle table

Si la création de table n'est pas souhaitée, on peut utiliser le champ `profile_json` de la table `profiles` existante :

```typescript
// Structure dans profile_json
{
  eco_mobility: {
    trips: [
      {
        id: "uuid",
        date: "2024-01-15T10:30:00Z",
        mode: "walk",
        distance_m: 1500,
        co2_saved_g: 180
      }
    ],
    total_co2_kg: 2.5,
    total_trips: 12,
    badges: ["beginner", "eco_citizen"]
  }
}
```

Cette approche est plus simple mais limite les possibilités de requêtes et d'agrégation côté serveur.

## Recommandation

La création de la table `eco_travel_logs` est recommandée pour :
- Permettre des requêtes SQL optimisées (classements, statistiques globales)
- Garantir l'intégrité des données avec les contraintes CHECK
- Faciliter l'évolution future (défis collectifs, comparaisons, exports)
- Respecter les bonnes pratiques de normalisation des données
