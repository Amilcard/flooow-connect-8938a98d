/**
 * Validation Schemas & Adapters
 * Zod schemas pour validation runtime + adapters avec defaults sécurisés
 */

import { z } from 'zod';
import type { Activity, ActivityRaw } from './domain';
import { getActivityImage } from '@/lib/imageMapping';
import { safeErrorMessage } from '@/utils/sanitize';
import { formatAgeRangeForCard } from '@/utils/categoryMapping';

/**
 * Schema Zod pour validation des créneaux horaires (availability_slots)
 * Fix pour anomalie 8.10 - Validation stricte des dates
 */
export const AvailabilitySlotSchema = z.object({
  id: z.string().uuid().optional(),
  activity_id: z.string().uuid().optional(),
  start: z.string().datetime('Date de début invalide (ISO 8601 requis)'),
  end: z.string().datetime('Date de fin invalide (ISO 8601 requis)'),
  capacity: z.number().int().min(0).optional(),
  day_of_week: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
}).refine(
  (data) => new Date(data.start) < new Date(data.end),
  { message: "La date de fin doit être après la date de début" }
);

/**
 * Schema Zod pour validation des activités
 */
export const ActivityDomainSchema = z.object({
  id: z.string().uuid('ID invalide'),
  title: z.string().min(1, 'Titre requis').max(200, 'Titre trop long'),
  image: z.string().default('https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop'),
  distance: z.string().optional(),
  ageRange: z.string().default('6-17 ans'),
  ageMin: z.number().int().min(6).max(17).optional(),
  ageMax: z.number().int().min(6).max(17).optional(),
  category: z.string().min(1, 'Catégorie requise'),
  categories: z.array(z.string()).default([]),
  price: z.number().min(0, 'Prix négatif interdit').default(0),
  hasAccessibility: z.boolean().default(false),
  hasFinancialAid: z.boolean().default(false),
  periodType: z.string().optional(),
  structureName: z.string().optional(),
  structureAddress: z.string().optional(),
  vacationPeriods: z.array(z.string()).default([]),
  accessibility: z.object({
    wheelchair: z.boolean().optional(),
    visual_impaired: z.boolean().optional(),
    hearing_impaired: z.boolean().optional(),
    mobility_impaired: z.boolean().optional(),
  }).optional(),
  mobility: z.object({
    TC: z.string().optional(),
    velo: z.boolean().optional(),
    covoit: z.boolean().optional(),
  }).optional(),
  description: z.string().optional(),
  aidesEligibles: z.array(z.string()).default([]),
  vacationType: z.enum(['sejour_hebergement', 'centre_loisirs', 'stage_journee']).optional(),
  priceUnit: z.string().optional(),
  durationDays: z.number().optional(),
  hasAccommodation: z.boolean().optional(),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
  joursHoraires: z.string().optional(),
  sessions: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS: Reduce cognitive complexity in toActivity
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if an image URL is valid
 */
const isValidImageUrl = (url: string | null | undefined): boolean =>
  !!(url && url.startsWith('http') && !url.includes('cdn.example.com'));

/**
 * Extract base activity fields with defaults
 */
const extractBaseFields = (raw: ActivityRaw) => {
  const title = raw.titre || raw.title || 'Activité sans titre';
  const ageMin = raw.ageMin ?? raw.age_min ?? 6;
  const ageMax = raw.ageMax ?? raw.age_max ?? 17;
  const price = raw.cout ?? raw.price ?? raw.price_base ?? null;
  const category = raw.theme || raw.category || (raw.categories && raw.categories[0]) || 'Loisirs';

  const firstImage = raw.images?.[0];
  const image = (firstImage && isValidImageUrl(firstImage))
    ? firstImage
    : getActivityImage(title, category, ageMin, ageMax);

  return { title, ageMin, ageMax, price, category, image };
};

/**
 * Extract vacation pricing fields
 */
const extractVacationFields = (raw: ActivityRaw): Partial<Activity> => {
  const fields: Partial<Activity> = {};
  if (raw.vacationType) fields.vacationType = raw.vacationType;
  if (raw.priceUnit || raw.price_unit) fields.priceUnit = raw.priceUnit || raw.price_unit;
  if (raw.durationDays) fields.durationDays = raw.durationDays;
  if (raw.hasAccommodation !== undefined) fields.hasAccommodation = raw.hasAccommodation;
  return fields;
};

/**
 * Extract mobility fields
 */
const extractMobilityFields = (raw: ActivityRaw): Partial<Activity> => {
  if (!raw.mobilite && !raw.covoiturage_enabled) return {};
  return {
    mobility: {
      TC: raw.mobilite?.TC || raw.lieu?.transport,
      velo: raw.mobilite?.velo,
      covoit: raw.mobilite?.covoit ?? raw.covoiturage_enabled,
    }
  };
};

/**
 * Extract location fields
 */
const extractLocationFields = (raw: ActivityRaw): Partial<Activity> => {
  if (!raw.structures?.location_lat || !raw.structures?.location_lng) return {};
  return {
    location: {
      lat: raw.structures.location_lat,
      lng: raw.structures.location_lng,
      adresse: raw.structures.address || '',
      ville: raw.structures.city || '',
      codePostal: raw.structures.postal_code || '',
    }
  };
};

/**
 * Extract enriched optional fields
 */
const extractEnrichedFields = (raw: ActivityRaw): Partial<Activity> => {
  const fields: Partial<Activity> = {};
  if (raw.lieu?.nom) fields.lieuNom = raw.lieu.nom;
  if (raw.lieu?.transport) fields.transportInfo = raw.lieu.transport;
  if (raw.santeTags?.length) fields.santeTags = raw.santeTags;
  if (raw.prerequis?.length) fields.prerequis = raw.prerequis;
  if (raw.pieces?.length) fields.piecesAFournir = raw.pieces;
  if (Array.isArray(raw.creneaux) && raw.creneaux.length) fields.creneaux = raw.creneaux;
  return fields;
};

// ═══════════════════════════════════════════════════════════════════════════

/**
 * Adapter avec defaults sécurisés
 * Convertit ActivityRaw (sources externes) → Activity (domain)
 */
export function toActivity(raw: ActivityRaw): Activity {
  const base = extractBaseFields(raw);

  // Construction objet avec valeurs par défaut
  const activity: Activity = {
    id: raw.id,
    title: base.title,
    image: base.image,
    ageRange: formatAgeRangeForCard(base.ageMin, base.ageMax),
    ageMin: base.ageMin,
    ageMax: base.ageMax,
    category: base.category,
    categories: raw.categories || [base.category],
    price: Number(base.price),
    hasAccessibility: !!(raw.accessibilite?.length) || !!(raw.accessibility_checklist?.wheelchair),
    hasFinancialAid: !!(raw.aidesEligibles?.length) || !!(raw.accepts_aid_types?.length),
    periodType: raw.period_type,
    structureName: raw.lieu?.nom || raw.structures?.name,
    structureAddress: raw.lieu?.adresse || raw.structures?.address,
    vacationPeriods: raw.vacation_periods || [],
    description: raw.description,
    aidesEligibles: raw.aidesEligibles || raw.accepts_aid_types || [],
    dateDebut: raw.date_debut,
    dateFin: raw.date_fin,
    joursHoraires: raw.jours_horaires,
    sessions: raw.sessions,
    // Optional fields via spread
    ...extractVacationFields(raw),
    ...extractMobilityFields(raw),
    ...(raw.accessibility_checklist && { accessibility: raw.accessibility_checklist }),
    ...extractLocationFields(raw),
    ...extractEnrichedFields(raw),
  };

  return activity;
}

/**
 * Validation avec safeParse et logging des écarts
 */
export function validateAndParseActivity(raw: ActivityRaw): {
  activity: Activity | null;
  success: boolean;
  errors?: string[];
} {
  try {
    const activity = toActivity(raw);
    const result = ActivityDomainSchema.safeParse(activity);

    if (!result.success) {
      const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      console.warn(`⚠️ Validation échouée pour activité ${raw.id}:`, errors);
      
      // On retourne l'activité avec defaults même si validation échoue
      // (pas d'erreur bloquante, principe de résilience)
      return {
        activity,
        success: false,
        errors,
      };
    }

    return {
      activity: result.data as Activity,
      success: true,
    };
  } catch (error) {
    console.error(safeErrorMessage(error, `Erreur critique parsing activité ${raw.id}`));
    return {
      activity: null,
      success: false,
      errors: ['Erreur critique de parsing'],
    };
  }
}
