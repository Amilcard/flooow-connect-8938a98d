import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DELETION_DELAY_DAYS = 30;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create Supabase client with service role
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

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'schedule'; // 'schedule', 'cancel', 'deactivate', 'reactivate'

    // ===== DEACTIVATE ACCOUNT (Temporary suspension) =====
    if (action === 'deactivate') {
      console.log(`[delete-account] Deactivating account for user ${user.id}`);

      // Get current profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_json')
        .eq('id', user.id)
        .single();

      const updatedProfileJson = {
        ...(profile?.profile_json || {}),
        account_status: 'deactivated',
        deactivated_at: new Date().toISOString(),
        deactivation_reason: body.reason || 'user_request'
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_json: updatedProfileJson })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Create notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'account_deactivated',
        payload: {
          deactivated_at: new Date().toISOString(),
          reactivation_available: true
        },
        read: false
      });

      console.log(`[delete-account] Account deactivated for user ${user.id}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Votre compte a été désactivé avec succès',
          deactivation_info: {
            deactivated_at: new Date().toISOString(),
            status: 'deactivated',
            reactivation_available: true,
            note: 'Vous pouvez réactiver votre compte à tout moment en vous reconnectant.'
          }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== REACTIVATE ACCOUNT =====
    if (action === 'reactivate') {
      console.log(`[delete-account] Reactivating account for user ${user.id}`);

      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_json')
        .eq('id', user.id)
        .single();

      const profileJson = profile?.profile_json || {};

      // Remove deactivation flags
      delete profileJson.account_status;
      delete profileJson.deactivated_at;
      delete profileJson.deactivation_reason;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_json: profileJson })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Create notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'account_reactivated',
        payload: {
          reactivated_at: new Date().toISOString()
        },
        read: false
      });

      console.log(`[delete-account] Account reactivated for user ${user.id}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Votre compte a été réactivé avec succès',
          reactivation_info: {
            reactivated_at: new Date().toISOString(),
            status: 'active'
          }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== CANCEL DELETION =====
    if (action === 'cancel') {
      // Cancel scheduled deletion
      const { error: cancelError } = await supabase
        .from('profiles')
        .update({
          profile_json: supabase
            .from('profiles')
            .select('profile_json')
            .eq('id', user.id)
            .single()
            .then((result: any) => {
              const profileJson = result.data?.profile_json || {};
              delete profileJson.deletion_scheduled_at;
              delete profileJson.deletion_scheduled_for;
              return profileJson;
            })
        })
        .eq('id', user.id);

      if (cancelError) {
        throw cancelError;
      }

      // Log cancellation
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'account_deletion_cancelled',
        payload: {
          cancelled_at: new Date().toISOString()
        },
        read: false
      });

      console.log(`[delete-account] Deletion cancelled for user ${user.id}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Account deletion cancelled successfully'
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Schedule deletion (default action)
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + DELETION_DELAY_DAYS);

    console.log(`[delete-account] Scheduling deletion for user ${user.id}`);

    // Check for active bookings
    const { data: activeBookings } = await supabase
      .from('bookings')
      .select('id, status, activities:activity_id(title), availability_slots:slot_id(start)')
      .eq('user_id', user.id)
      .in('status', ['en_attente', 'validee']);

    const futureBookings = activeBookings?.filter((booking: any) => {
      const slotStart = new Date(booking.availability_slots?.start);
      return slotStart > new Date();
    }) || [];

    if (futureBookings.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'active_bookings',
          message: `Vous avez ${futureBookings.length} réservation(s) active(s). Veuillez les annuler avant de supprimer votre compte.`,
          active_bookings: futureBookings.length
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update profile with deletion schedule
    const { data: profile } = await supabase
      .from('profiles')
      .select('profile_json')
      .eq('id', user.id)
      .single();

    const updatedProfileJson = {
      ...(profile?.profile_json || {}),
      deletion_scheduled_at: new Date().toISOString(),
      deletion_scheduled_for: scheduledFor.toISOString(),
      deletion_reason: body.reason || 'user_request'
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        profile_json: updatedProfileJson
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'account_deletion_scheduled',
      payload: {
        scheduled_at: new Date().toISOString(),
        scheduled_for: scheduledFor.toISOString(),
        delay_days: DELETION_DELAY_DAYS,
        cancellable_until: scheduledFor.toISOString()
      },
      read: false
    });

    console.log(`[delete-account] Deletion scheduled for user ${user.id} on ${scheduledFor.toISOString()}`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Votre compte sera supprimé le ${scheduledFor.toLocaleDateString('fr-FR')}`,
        deletion_info: {
          scheduled_at: new Date().toISOString(),
          scheduled_for: scheduledFor.toISOString(),
          delay_days: DELETION_DELAY_DAYS,
          cancellable: true,
          cancel_instructions: "Vous pouvez annuler cette demande depuis vos paramètres avant la date de suppression."
        },
        gdpr_compliance: {
          article: "Article 17 - Right to erasure (right to be forgotten)",
          delay_reason: "Délai de rétractation de 30 jours",
          data_retention: "Vos données seront définitivement supprimées après ce délai"
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[delete-account] Internal error:", err);
    return new Response(
      JSON.stringify({
        error: "internal_error",
        message: err instanceof Error ? err.message : String(err)
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
