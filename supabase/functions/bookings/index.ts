import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { BookingSchema, BookingValidationSchema, parseRequestBody } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "invalid_token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    
    // Route: POST /bookings - Create booking
    if (req.method === 'POST' && pathParts.length === 0) {
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
          console.log(`[bookings] Idempotency hit: ${idempotency_key}`);
          return new Response(
            JSON.stringify({ ...existing, idempotent: true }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Verify child belongs to user
      const { data: child, error: childError } = await supabase
        .from('children')
        .select('id')
        .eq('id', child_id)
        .eq('user_id', user.id)
        .single();

      if (childError || !child) {
        return new Response(
          JSON.stringify({ error: "child_not_found_or_unauthorized" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
          JSON.stringify({ error: "slot_not_found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (slot.seats_remaining <= 0) {
        return new Response(
          JSON.stringify({ error: "no_seats_available", seats_remaining: 0 }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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
          status: 'en_attente',
        })
        .select()
        .single();

      if (bookingError) {
        console.error(`[bookings] Creation error:`, bookingError);
        
        // Check if it's a seat availability error from trigger
        if (bookingError.message?.includes('Aucune place disponible')) {
          return new Response(
            JSON.stringify({ error: "no_seats_available", message: bookingError.message }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ error: "booking_creation_failed", details: bookingError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get updated seat count
      const { data: updatedSlot } = await supabase
        .from('availability_slots')
        .select('seats_remaining')
        .eq('id', slot_id)
        .single();

      console.log(`[bookings] Created: ${booking.id}, seats remaining: ${updatedSlot?.seats_remaining}`);

      return new Response(
        JSON.stringify({
          ...booking,
          seats_remaining_after: updatedSlot?.seats_remaining || 0,
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Route: GET /bookings/:id - Get booking by ID
    if (req.method === 'GET' && pathParts.length === 1) {
      const bookingId = pathParts[0];

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

    // Route: PATCH /bookings/:id/validate - Validate/reject booking (structure role)
    if (req.method === 'PATCH' && pathParts.length === 2 && pathParts[1] === 'validate') {
      const bookingId = pathParts[0];
      
      const validationResult = await parseRequestBody(req, BookingValidationSchema);
      
      if (!validationResult.success) {
        return new Response(
          JSON.stringify({ 
            error: validationResult.error,
            details: validationResult.details 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { action, reason_code } = validationResult.data;

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

      console.log(`[bookings] Validated: ${bookingId}, status: ${newStatus}`);

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
    console.error("[bookings] Internal error:", err);
    return new Response(
      JSON.stringify({ 
        error: "internal_error", 
        message: err instanceof Error ? err.message : String(err) 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
