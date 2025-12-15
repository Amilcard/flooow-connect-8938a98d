# Export structuré : Colonies de vacances – Problématique et solution

## Problématique

De nombreuses activités de type "colonie de vacances" ou "séjour hébergement" ne disposent pas, pour chaque session, d'une date de début ET de fin explicite. Le fichier source ne liste que les dates de début (ex : 2026-07-04, 2026-07-11, ...), sans précision de la durée réelle de chaque séjour. Cela pose problème pour :
- L'affichage précis des séjours sur le site (calendrier, filtres, etc.)
- La gestion des réservations (conflits de dates, durée, etc.)
- La conformité des données pour les utilisateurs et partenaires

## Solution à apporter

1. **Compléter les données** :
   - Pour chaque session, ajouter une date de fin explicite (ex : date_debut + 7 jours si séjour d'une semaine).
   - Vérifier la durée réelle de chaque séjour (si variable selon la session ou la colonie).
2. **Structurer les exports** :
   - Exporter chaque colonie avec :
     - ID
     - Nom
     - Prix
     - Période
     - Nombre de sessions (vacances/scolaires)
     - Liste des dates de début
     - Durée (à compléter)
     - Liste des dates de fin (à calculer ou compléter)
3. **Automatiser la correction** :
   - Script ou outil pour générer automatiquement les dates de fin à partir des dates de début et de la durée standard (ex : 7 jours).
   - Générer un CSV ou JSON pour import/correction en base.

## Exemple d'export structuré (JSON)

[
  {
    "id": "afbd765b-9761-4bf0-8596-bd604076f2e3",
    "nom": "Colonie Multi-activités - Vacances",
    "prix": "600€",
    "periode": "Vacances",
    "sessions": 6,
    "sessions_vacances": 6,
    "sessions_scolaires": 0,
    "dates_debut": ["2026-07-04", "2026-07-11", "2026-07-18", "2026-08-01", "2026-08-08", "2026-08-22"],
    "duree": "à compléter (ex: 7 jours)",
    "dates_fin": ["à calculer"]
  },
  // ... autres colonies ...
]

## Prochaine étape
- Définir la durée exacte de chaque séjour (si standard ou variable)
- Générer automatiquement les dates de fin
- Mettre à jour la base ou le fichier source avec ces informations
