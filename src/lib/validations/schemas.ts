import { z } from 'zod';

// Schéma validation activités
export const ActivitySchema = z.object({
  title: z.string()
    .min(3, "Titre trop court (minimum 3 caractères)")
    .max(100, "Titre trop long (maximum 100 caractères)")
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-']+$/, "Caractères invalides dans le titre"),
  
  description: z.string()
    .min(10, "Description trop courte (minimum 10 caractères)")
    .max(2000, "Description trop longue (maximum 2000 caractères)"),
  
  category: z.enum(['Sport', 'Culture', 'Loisirs', 'Scolarité', 'Vacances'], {
    errorMap: () => ({ message: "Catégorie invalide" })
  }),
  
  age_min: z.number()
    .int("L'âge doit être un nombre entier")
    .min(6, "Âge minimum : 6 ans")
    .max(17, "Âge maximum : 17 ans"),
  
  age_max: z.number()
    .int("L'âge doit être un nombre entier")
    .min(6, "Âge minimum : 6 ans")
    .max(17, "Âge maximum : 17 ans"),
  
  price: z.number()
    .min(0, "Le prix ne peut pas être négatif")
    .max(1000, "Prix maximum : 1000€"),
  
  location: z.object({
    address: z.string().min(5, "Adresse trop courte"),
    postal_code: z.string().regex(/^\d{5}$/, "Code postal invalide (5 chiffres requis)"),
    city: z.string().min(2, "Nom de ville invalide"),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }),
  
  organizer_id: z.string().uuid("ID organisateur invalide"),
  
  available_spots: z.number()
    .int()
    .min(1, "Minimum 1 place disponible")
    .max(100, "Maximum 100 places")
});

// Schéma validation réservations
export const BookingSchema = z.object({
  activity_id: z.string().uuid("ID activité invalide"),
  slot_id: z.string().uuid("ID créneau invalide"),
  child_id: z.string().uuid("ID enfant invalide"),
  idempotency_key: z.string().min(1).max(100).optional(),
  express_flag: z.boolean().default(false),
  transport_mode: z.enum(['walking', 'bus', 'car', 'bike', 'covoiturage', 'non_renseigne']).default('non_renseigne')
});

export const BookingValidationSchema = z.object({
  action: z.enum(['accept', 'reject'], {
    errorMap: () => ({ message: "Action invalide (accept ou reject requis)" })
  }),
  reason_code: z.string().max(500, "Raison trop longue (maximum 500 caractères)").optional()
});

// Schéma validation simulation d'aides
export const AidSimulationSchema = z.object({
  booking_id: z.string().uuid("ID réservation invalide").optional(),
  child_id: z.string().uuid("ID enfant invalide").optional(),
  activity_id: z.string().uuid("ID activité invalide"),
  simulated_aids: z.array(z.object({
    aid_name: z.string().max(200, "Nom d'aide trop long"),
    amount: z.number().positive("Le montant doit être positif").max(10000, "Montant maximum : 10000€"),
    territory_level: z.string().max(50, "Niveau territorial trop long"),
    official_link: z.string().url("Lien invalide").optional()
  })).max(20, "Maximum 20 aides par simulation")
});

// Schéma validation profil famille
export const FamilyProfileSchema = z.object({
  email: z.string()
    .email("Email invalide")
    .max(255, "Email trop long"),
  
  first_name: z.string()
    .min(2, "Prénom trop court")
    .max(50, "Prénom trop long")
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "Caractères invalides dans le prénom"),
  
  last_name: z.string()
    .min(2, "Nom trop court")
    .max(50, "Nom trop long")
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "Caractères invalides dans le nom"),
  
  postal_code: z.string()
    .regex(/^\d{5}$/, "Code postal invalide (5 chiffres requis)"),
  
  quotient_familial: z.number()
    .min(0, "Le quotient familial ne peut pas être négatif")
    .max(10000, "Quotient familial maximum : 10000€")
    .optional()
    .nullable(),
  
  children: z.array(z.object({
    first_name: z.string().min(2).max(50),
    birth_date: z.string()
      .datetime()
      .refine(
        (date) => {
          const age = new Date().getFullYear() - new Date(date).getFullYear();
          return age >= 6 && age <= 17;
        },
        "L'enfant doit avoir entre 6 et 17 ans"
      )
  })).min(1, "Au moins 1 enfant requis")
});

// Schéma validation recherche
export const SearchActivitiesSchema = z.object({
  category: z.enum(['Sport', 'Culture', 'Loisirs', 'Scolarité', 'Vacances']).optional(),
  postal_code: z.string().regex(/^\d{5}$/).optional(),
  age: z.number().int().min(6).max(17).optional(),
  price_max: z.number().min(0).max(1000).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

// Schéma validation auth
export const LoginSchema = z.object({
  email: z.string()
    .email("Email invalide")
    .max(255, "Email trop long"),
  password: z.string()
    .min(8, "Mot de passe trop court (minimum 8 caractères)")
    .max(128, "Mot de passe trop long (maximum 128 caractères)"),
  device: z.string().max(100, "Information appareil trop longue").optional()
});

export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1, "Token de rafraîchissement requis")
});
