import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify caller is superadmin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'superadmin')
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Accès refusé - Superadmin requis' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const { profileId, action, reason } = await req.json();

    console.log('Validating family account:', { profileId, action, reason });

    if (!profileId || !action) {
      return new Response(
        JSON.stringify({ error: 'profileId et action requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Action invalide (approve ou reject)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'reject' && !reason) {
      return new Response(
        JSON.stringify({ error: 'Raison requise pour le rejet' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get profile email for notification
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, account_status')
      .eq('id', profileId)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Profil introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (profile.account_status !== 'pending') {
      return new Response(
        JSON.stringify({ error: `Ce compte est déjà ${profile.account_status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update profile status
    const updateData: any = {
      account_status: action === 'approve' ? 'active' : 'rejected',
      validated_at: new Date().toISOString(),
      validated_by: user.id
    };

    if (action === 'reject') {
      updateData.rejection_reason = reason;
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', profileId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la mise à jour' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification for user
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: profileId,
        type: action === 'approve' ? 'account_validated' : 'account_rejected',
        payload: {
          message: action === 'approve' 
            ? 'Votre compte a été validé ! Vous pouvez maintenant réserver des activités.'
            : `Votre demande de compte a été refusée. Raison : ${reason}`,
          validated_at: new Date().toISOString()
        }
      });

    console.log('Family account validation completed:', action);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: action === 'approve' 
          ? `Compte validé avec succès`
          : `Compte rejeté`,
        email: profile.email
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Erreur interne' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
