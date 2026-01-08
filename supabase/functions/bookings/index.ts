import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { BookingSchema, BookingValidationSchema, parseRequestBody } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 1 requête par seconde par IP
const lastCall: Record<string, number> = {};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  
  if (lastCall[ip] && now - lastCall[ip] < 1000) {
    return new Response("Trop rapide 🙂 Attendez une seconde.", { 
      status: 429,
      headers: corsHeaders 
    });
  }
  
  lastCall[ip] = now;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create Supabase client with service role (bypasses RLS for admin operations)
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "missing_authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    // Create user-context client for RPCs so auth.uid() is set in Postgres
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "invalid_token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Route: POST - Create booking (default action)
    if (req.method === 'POST') {
      const validationResult = await parseRequestBody(req, BookingSchema);
      
      if (!validationResult.success) {
        return new Response(
          JSON.stringify({ 
            error: validationResult.error,
            details: validationResult.details 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { activity_id, slot_id, child_id, idempotency_key, express_flag } = validationResult.data;

      // Check idempotency - if same key exists, return existing booking
      if (idempotency_key) {
        const { data: existing } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .eq('idempotency_key', idempotency_key)
          .single();

        if (existing) {
          console.log('[bookings] Idempotency hit');
          return new Response(
            JSON.stringify({ ...existing, idempotent: true }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Verify child belongs to user
      const { data: child, error: childError } = await supabase
        .from('children')
        .select('id, dob')
        .eq('id', child_id)
        .eq('user_id', user.id)
        .single();

      if (childError || !child) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: "CHILD_NOT_FOUND_OR_UNAUTHORIZED",
              message: "L'enfant sélectionné est introuvable ou ne vous appartient pas",
              hint: "Vérifiez que cet enfant est bien enregistré dans votre compte"
            }
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // P1: Validate eligibility (age + period) using database function
      const { data: eligibilityCheck, error: eligibilityError } = await supabase
        .rpc('validate_booking_eligibility', {
          p_child_id: child_id,
          p_activity_id: activity_id,
          p_slot_id: slot_id
        });

      if (eligibilityError) {
        console.error('[bookings] Eligibility check failed');
        return new Response(
          JSON.stringify({
            code: "ELIGIBILITY_CHECK_FAILED",
            message: "Impossible de vérifier l'éligibilité pour cette réservation",
            hint: "Veuillez réessayer ou contacter le support",
            details: eligibilityError.message
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Reject if not eligible
      if (eligibilityCheck && !eligibilityCheck.eligible) {
        console.log('[bookings] Eligibility rejected');
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: "NOT_ELIGIBLE",
              message: eligibilityCheck.message || "Cette réservation n'est pas éligible",
              hint: "Vérifiez l'âge de l'enfant, la période et les conflits horaires",
              reason: eligibilityCheck.reason,
              details: eligibilityCheck
            }
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get current slot info
      const { data: slot, error: slotError } = await supabase
        .from('availability_slots')
        .select('seats_remaining, activity_id')
        .eq('id', slot_id)
        .single();

      if (slotError || !slot) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: "SLOT_NOT_FOUND",
              message: "Le créneau horaire sélectionné est introuvable",
              hint: "Vérifiez que le créneau existe toujours"
            }
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (slot.seats_remaining <= 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: "NO_SEATS_AVAILABLE",
              message: "Aucune place disponible pour ce créneau",
              hint: "Veuillez choisir un autre créneau ou vous inscrire sur liste d'attente"
            },
            seats_remaining: 0
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ==========================================
      // CALCULATE PRICING AND FINANCIAL AIDS
      // ==========================================

      // Get activity details (price, categories)
      const { data: activity, error: activityError } = await supabase
        .from('activities')
        .select('price_base, category')
        .eq('id', activity_id)
        .single();

      if (activityError || !activity) {
        console.error('[bookings] Activity not found');
        return new Response(
          JSON.stringify({
            error: "activity_not_found",
            code: "ACTIVITY_NOT_FOUND",
            message: "L'activité demandée n'existe pas",
            hint: "Vérifiez l'ID de l'activité"
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const basePriceCents = Math.round((activity.price_base || 0) * 100);
      let aidsTotalCents = 0;
      let aidsApplied: Array<{ aid_name: string; amount_cents: number; territory_level: string }> = [];

      // Only calculate aids if activity has a price > 0
      if (activity.price_base > 0) {
        // Get child's age for aids calculation
        const childAge = Math.floor(
          (Date.now() - new Date(child.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        );

        // Get user profile for QF and city code
        const { data: profile } = await supabase
          .from('profiles')
          .select('quotient_familial, postal_code, city_insee, profile_json')
          .eq('id', user.id)
          .single();

        const quotientFamilial = profile?.quotient_familial ?? profile?.profile_json?.quotient_familial ?? 0;
        const cityCode = profile?.city_insee ?? profile?.profile_json?.city_code ?? '';

        // Get slot duration for per-day aids calculation
        const { data: slotDetails } = await supabase
          .from('availability_slots')
          .select('start, end')
          .eq('id', slot_id)
          .single();

        const durationDays = slotDetails
          ? Math.max(1, Math.ceil(
              (new Date(slotDetails.end).getTime() - new Date(slotDetails.start).getTime())
              / (24 * 60 * 60 * 1000)
            ))
          : 1;

        // SERVER-SIDE AIDS CALCULATION - Using aid_grid (source of truth)
        // RPC calculate_family_aid applies 70% cap and 30% minimum RAC automatically
        const { data: aidResult, error: aidsError } = await userClient
          .rpc('calculate_family_aid', {
            p_activity_id: activity_id,
            p_quotient_familial: quotientFamilial,
            p_external_aid_euros: 0 // TODO: Add Pass'Sport calculation if needed
          });

        if (aidsError) {
          console.error('[bookings] Aids calculation failed:', aidsError);
          // Continue without aids rather than failing the booking
        } else if (aidResult && aidResult.total_aid_euros > 0) {
          // Extract aid breakdown from RPC result
          const qfReduction = aidResult.qf_reduction || 0;
          const externalAids = aidResult.external_aids || 0;
          const totalAidEuros = aidResult.total_aid_euros || 0;

          // Build aids_applied array with breakdown
          if (qfReduction > 0) {
            aidsApplied.push({
              aid_name: `Aide CAF (${aidResult.qf_bracket || 'QF'})`,
              amount_cents: Math.round(qfReduction * 100),
              territory_level: 'national'
            });
          }

          if (externalAids > 0) {
            aidsApplied.push({
              aid_name: 'Aides externes (Pass\'Sport, etc.)',
              amount_cents: Math.round(externalAids * 100),
              territory_level: 'national'
            });
          }

          // Total aids in cents (already capped at 70% by RPC)
          aidsTotalCents = Math.round(totalAidEuros * 100);

          console.log('[bookings] Aid calculation (aid_grid):', {
            qf_bracket: aidResult.qf_bracket,
            qf_reduction: qfReduction,
            total_aid: totalAidEuros,
            remaining: aidResult.remaining_euros,
            aid_percentage: aidResult.aid_percentage
          });
        }
      }

      // Calculate final price (ensure it's not negative)
      const finalPriceCents = Math.max(0, basePriceCents - aidsTotalCents);

      console.log('[bookings] Pricing calculated');

      // ==========================================
      // V1 FLOW: Auto-validation si express_flag = true
      // ==========================================
      const isV1AutoValidate = express_flag === true;
      const bookingStatus = isV1AutoValidate ? 'validee' : 'en_attente';
      
      // Create booking with trigger that will decrement seat atomically
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          activity_id,
          slot_id,
          child_id,
          idempotency_key: idempotency_key || null,
          express_flag: express_flag || false,
          status: bookingStatus,
          base_price_cents: basePriceCents,
          aids_total_cents: aidsTotalCents,
          final_price_cents: finalPriceCents,
          aids_applied: aidsApplied,
          history: isV1AutoValidate ? [{
            timestamp: new Date().toISOString(),
            action: 'auto_validated_v1',
            reason: 'V1 demo mode - automatic validation',
            express_flag: true
          }] : []
        })
        .select()
        .single();

      if (bookingError) {
        console.error('[bookings] Creation error');

        // Check if it's a seat availability error from trigger
        if (bookingError.message?.includes('Aucune place disponible')) {
          return new Response(
            JSON.stringify({
              success: false,
              error: {
                code: "NO_SEATS_AVAILABLE",
                message: "Aucune place disponible pour ce créneau",
                hint: "Veuillez choisir un autre créneau ou vous inscrire sur liste d'attente"
              }
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if it's an RLS error
        if (bookingError.code === '42501' || bookingError.message?.includes('permission denied')) {
          return new Response(
            JSON.stringify({
              success: false,
              error: {
                code: "RLS_DENIED",
                message: "Vous n'êtes pas autorisé à créer cette réservation",
                hint: "Vérifiez que l'enfant vous appartient et que vous êtes connecté"
              }
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if it's a constraint violation
        if (bookingError.code?.startsWith('23')) {
          return new Response(
            JSON.stringify({
              success: false,
              error: {
                code: "CONSTRAINT_VIOLATION",
                message: "Les données de réservation ne respectent pas les contraintes",
                hint: "Vérifiez que les montants sont valides (aides ≤ prix de base)",
                details: bookingError.message
              }
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: "BOOKING_CREATION_FAILED",
              message: "Impossible de créer la réservation",
              hint: "Veuillez réessayer ou contacter le support",
              details: bookingError.message
            }
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // V1: Créer validations_parentales pour traçabilité (même en auto-validate)
      if (isV1AutoValidate) {
        await supabase.from('validations_parentales').insert({
          booking_id: booking.id,
          parent_id: user.id,
          status: 'validee',
          validated_at: new Date().toISOString()
        });
        
        console.log('[bookings] V1 auto-validated');
      }

      // Get updated seat count
      const { data: updatedSlot } = await supabase
        .from('availability_slots')
        .select('seats_remaining')
        .eq('id', slot_id)
        .single();

      console.log('[bookings] Created successfully');

      return new Response(
        JSON.stringify({
          success: true,
          ...booking,
          seats_remaining_after: updatedSlot?.seats_remaining || 0,
          pricing: {
            base_price_cents: basePriceCents,
            aids_total_cents: aidsTotalCents,
            final_price_cents: finalPriceCents,
            base_price_euros: basePriceCents / 100,
            aids_total_euros: aidsTotalCents / 100,
            final_price_euros: finalPriceCents / 100,
            aids_applied: aidsApplied
          }
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Route: GET - Get booking by ID (requires booking_id in query params)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const bookingId = url.searchParams.get('booking_id');
      
      if (!bookingId) {
        return new Response(
          JSON.stringify({ error: "missing_booking_id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
          *,
          activities:activity_id (title, images),
          children:child_id (first_name),
          availability_slots:slot_id (start, end)
        `)
        .eq('id', bookingId)
        .eq('user_id', user.id)
        .single();

      if (error || !booking) {
        return new Response(
          JSON.stringify({ error: "booking_not_found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify(booking),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Route: PATCH - Validate/reject booking (structure role, requires booking_id and action in body)
    if (req.method === 'PATCH') {
      const body = await req.json();
      const bookingId = body.booking_id;
      
      if (!bookingId) {
        return new Response(
          JSON.stringify({ error: "missing_booking_id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const action = body.action;
      const reason_code = body.reason_code;
      
      if (!action || !['accept', 'reject'].includes(action)) {
        return new Response(
          JSON.stringify({ error: "invalid_action", message: "Action must be 'accept' or 'reject'" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify user has structure role for this booking's activity
      const { data: booking } = await supabase
        .from('bookings')
        .select('activity_id, activities!inner(structure_id)')
        .eq('id', bookingId)
        .single();

      if (!booking) {
        return new Response(
          JSON.stringify({ error: "booking_not_found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // SECURITY: Verify user has structure role
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'structure')
        .single();

      if (roleError || !userRole) {
        console.warn(`[bookings] Unauthorized validation attempt by user ${user.id}`);
        return new Response(
          JSON.stringify({ 
            error: 'unauthorized_insufficient_permissions',
            message: 'Seuls les organisateurs peuvent valider les réservations'
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // SECURITY: Verify structure manages this activity
      const activity = Array.isArray(booking.activities) ? booking.activities[0] : booking.activities;
      const structureId = activity?.structure_id;
      
      if (!structureId) {
        return new Response(
          JSON.stringify({ error: "invalid_booking_structure" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: userStructure, error: structureError } = await supabase
        .from('structures')
        .select('id')
        .eq('id', structureId)
        .single();

      if (structureError || !userStructure) {
        console.warn(`[bookings] User ${user.id} attempted to validate booking for unauthorized structure`);
        return new Response(
          JSON.stringify({ 
            error: 'unauthorized_wrong_structure',
            message: 'Vous ne pouvez valider que les réservations de votre structure'
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const newStatus = action === 'accept' ? 'validee' : 'refusee';
      
      const { data: updated, error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          reason_code: action === 'reject' ? reason_code : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "validation_failed", details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log('[bookings] Validated successfully');

      return new Response(
        JSON.stringify(updated),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: "route_not_found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[bookings] Internal error");
    return new Response(
      JSON.stringify({ 
        error: "internal_error", 
        message: err instanceof Error ? err.message : String(err) 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
