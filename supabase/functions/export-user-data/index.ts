import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    console.log(`[export-user-data] Exporting data for user ${user.id}`);

    // Fetch all user data from different tables
    const [
      profileResult,
      childrenResult,
      bookingsResult,
      reviewsResult,
      notificationsResult,
      userRolesResult
    ] = await Promise.all([
      // Profile
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single(),

      // Children
      supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id),

      // Bookings with related data
      supabase
        .from('bookings')
        .select(`
          *,
          activities:activity_id (title, description, category),
          availability_slots:slot_id (start, end),
          children:child_id (first_name, dob)
        `)
        .eq('user_id', user.id),

      // Reviews
      supabase
        .from('reviews')
        .select(`
          *,
          activities:activity_id (title)
        `)
        .eq('user_id', user.id),

      // Notifications
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id),

      // User roles
      supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
    ]);

    // Check for errors
    if (profileResult.error) {
      console.error('[export-user-data] Profile fetch error:', profileResult.error);
    }

    // Build comprehensive export object (GDPR Art. 20 compliant)
    const exportData = {
      // Metadata
      export_info: {
        export_date: new Date().toISOString(),
        user_id: user.id,
        format: "JSON",
        gdpr_article: "Article 20 - Right to data portability",
        generated_by: "InKlusif Platform"
      },

      // Personal account data
      account: {
        email: user.email,
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at,
        email_confirmed: user.email_confirmed_at !== null,
        phone: user.phone,
        metadata: user.user_metadata
      },

      // Profile data
      profile: profileResult.data || null,

      // Children data
      children: {
        count: childrenResult.data?.length || 0,
        data: childrenResult.data || []
      },

      // Bookings history
      bookings: {
        count: bookingsResult.data?.length || 0,
        data: bookingsResult.data || []
      },

      // Reviews written
      reviews: {
        count: reviewsResult.data?.length || 0,
        data: reviewsResult.data || []
      },

      // Notifications received
      notifications: {
        count: notificationsResult.data?.length || 0,
        data: notificationsResult.data || []
      },

      // User roles
      roles: userRolesResult.data || [],

      // Privacy notice
      privacy_notice: {
        purpose: "This export contains all personal data we hold about you.",
        retention: "Your data is retained as long as your account is active.",
        rights: [
          "Right to access (Art. 15)",
          "Right to rectification (Art. 16)",
          "Right to erasure (Art. 17)",
          "Right to data portability (Art. 20)"
        ],
        contact: "privacy@inklusif.fr"
      }
    };

    // Log export event (for audit trail)
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'data_export',
      payload: {
        export_date: new Date().toISOString(),
        data_types: ['profile', 'children', 'bookings', 'reviews', 'notifications']
      },
      read: false
    });

    console.log(`[export-user-data] Export completed for user ${user.id}`);

    // Return export as JSON
    return new Response(
      JSON.stringify(exportData, null, 2),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="inklusif-export-${user.id}-${Date.now()}.json"`
        }
      }
    );

  } catch (err) {
    console.error("[export-user-data] Internal error:", err);
    return new Response(
      JSON.stringify({
        error: "internal_error",
        message: err instanceof Error ? err.message : String(err)
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
