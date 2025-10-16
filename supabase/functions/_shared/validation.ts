// Shared validation schemas for edge functions
// Using Zod for runtime type validation
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const MAX_BODY_SIZE = 1024 * 1024; // 1MB limit to prevent DoS

// Helper to validate request body size
export async function parseRequestBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string; details?: unknown }> {
  try {
    const bodyText = await req.text();
    
    if (bodyText.length > MAX_BODY_SIZE) {
      return {
        success: false,
        error: 'payload_too_large',
        details: `Request body exceeds ${MAX_BODY_SIZE} bytes`
      };
    }

    const bodyJson = JSON.parse(bodyText);
    const result = schema.safeParse(bodyJson);

    if (!result.success) {
      return {
        success: false,
        error: 'invalid_input',
        details: result.error.errors
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      error: 'invalid_json',
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

// Booking creation schema
export const BookingSchema = z.object({
  activity_id: z.string().uuid('ID activité invalide'),
  slot_id: z.string().uuid('ID créneau invalide'),
  child_id: z.string().uuid('ID enfant invalide'),
  idempotency_key: z.string().min(1).max(100).optional(),
  express_flag: z.boolean().default(false),
  transport_mode: z.enum(['walking', 'bus', 'car', 'bike', 'covoiturage', 'non_renseigne']).default('non_renseigne')
});

// Booking validation schema
export const BookingValidationSchema = z.object({
  action: z.enum(['accept', 'reject'], {
    errorMap: () => ({ message: 'Action invalide (accept ou reject requis)' })
  }),
  reason_code: z.string().max(500, 'Raison trop longue (maximum 500 caractères)').optional()
});

// Aid simulation schema
export const AidSimulationSchema = z.object({
  booking_id: z.string().uuid('ID réservation invalide').optional(),
  child_id: z.string().uuid('ID enfant invalide').optional(),
  activity_id: z.string().uuid('ID activité invalide'),
  simulated_aids: z.array(z.object({
    aid_name: z.string().max(200, "Nom d'aide trop long"),
    amount: z.number().positive('Le montant doit être positif').max(10000, 'Montant maximum : 10000€'),
    territory_level: z.string().max(50, 'Niveau territorial trop long'),
    official_link: z.string().url('Lien invalide').optional()
  })).max(20, 'Maximum 20 aides par simulation')
});

// Authentication schemas
export const LoginSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .max(255, 'Email trop long'),
  password: z.string()
    .min(8, 'Mot de passe trop court (minimum 8 caractères)')
    .max(128, 'Mot de passe trop long (maximum 128 caractères)'),
  device: z.string().max(100, 'Information appareil trop longue').default('web')
});

export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Token de rafraîchissement requis')
});
