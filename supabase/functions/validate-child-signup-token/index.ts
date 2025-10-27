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

    const { token, action } = await req.json();

    console.log('Validating child signup:', { token, action });

    // Validation des paramètres
    if (!token || !['approve', 'reject'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Token et action (approve/reject) requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer la demande
    const { data: request, error: requestError } = await supabaseAdmin
      .from('child_signup_requests')
      .select('*')
      .eq('validation_token', token)
      .eq('status', 'pending')
      .maybeSingle();

    if (requestError) {
      console.error('Error fetching request:', requestError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la récupération de la demande' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!request) {
      return new Response(
        JSON.stringify({ error: 'Lien invalide ou déjà utilisé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier expiration
    if (new Date(request.expires_at) < new Date()) {
      await supabaseAdmin
        .from('child_signup_requests')
        .update({ status: 'expired' })
        .eq('id', request.id);

      return new Response(
        JSON.stringify({ error: 'Ce lien a expiré (48h dépassées)' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Trouver le parent
    const { data: parent, error: parentError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, account_status')
      .eq('email', request.parent_email)
      .maybeSingle();

    if (parentError || !parent) {
      console.error('Parent not found:', request.parent_email);
      return new Response(
        JSON.stringify({
          error: 'Compte parent non trouvé. Créez un compte d\'abord sur l\'application.'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (parent.account_status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Le compte parent doit être validé par un administrateur' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cas REJET
    if (action === 'reject') {
      await supabaseAdmin
        .from('child_signup_requests')
        .update({
          status: 'rejected',
          validated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      console.log('Request rejected successfully');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Demande d\'inscription rejetée'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cas APPROBATION
    // Vérifier si l'enfant existe déjà
    const { data: existingChild } = await supabaseAdmin
      .from('children')
      .select('id')
      .eq('user_id', parent.id)
      .eq('first_name', request.child_first_name)
      .eq('dob', request.child_dob)
      .maybeSingle();

    if (existingChild) {
      // Marquer la demande comme validée quand même
      await supabaseAdmin
        .from('child_signup_requests')
        .update({
          status: 'validated',
          validated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: `${request.child_first_name} était déjà inscrit(e)`,
          child_id: existingChild.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer l'enfant
    const { data: newChild, error: childError } = await supabaseAdmin
      .from('children')
      .insert({
        user_id: parent.id,
        first_name: request.child_first_name,
        dob: request.child_dob
      })
      .select()
      .single();

    if (childError) {
      console.error('Error creating child:', childError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de l\'enfant' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mettre à jour la demande
    await supabaseAdmin
      .from('child_signup_requests')
      .update({
        status: 'validated',
        validated_at: new Date().toISOString()
      })
      .eq('id', request.id);

    // Notification au parent
    const { error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: parent.id,
        type: 'child_signup_validated',
        payload: {
          child_name: newChild.first_name,
          child_id: newChild.id,
          validated_via: 'email'
        }
      });

    if (notifError) {
      console.error('Failed to create notification:', notifError);
      // Continue quand même (notification non critique)
    }

    console.log('Child created successfully:', newChild.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${newChild.first_name} a été inscrit(e) avec succès !`,
        child_id: newChild.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
