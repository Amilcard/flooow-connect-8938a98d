import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 1 requête par seconde par IP
const lastCall: Record<string, number> = {};

serve(async (req) => {
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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { familyCode, firstName, dob } = await req.json();

    console.log('Child signup via code:', { familyCode, firstName, dob });

    // Validate input
    if (!familyCode || !firstName || !dob) {
      return new Response(
        JSON.stringify({ error: 'Code famille, prénom et date de naissance requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find parent by family code
    const { data: parent, error: parentError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, account_status')
      .eq('family_code', familyCode.toUpperCase())
      .maybeSingle();

    if (parentError || !parent) {
      return new Response(
        JSON.stringify({ error: 'Code famille invalide' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check parent account is active
    if (parent.account_status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Le compte parent doit être validé' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for duplicate child
    const { data: existingChild } = await supabaseAdmin
      .from('children')
      .select('id')
      .eq('user_id', parent.id)
      .eq('first_name', firstName)
      .eq('dob', dob)
      .maybeSingle();

    if (existingChild) {
      return new Response(
        JSON.stringify({ error: 'Cet enfant est déjà inscrit' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create child
    const { data: newChild, error: childError } = await supabaseAdmin
      .from('children')
      .insert({
        user_id: parent.id,
        first_name: firstName,
        dob: dob
      })
      .select()
      .single();

    if (childError) {
      console.error('Error creating child:', childError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'inscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notification to parent
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: parent.id,
        type: 'child_self_signup',
        payload: {
          child_name: firstName,
          child_dob: dob,
          child_id: newChild.id,
          signup_method: 'family_code'
        }
      });

    console.log('Child registered successfully:', newChild.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `${firstName} a été inscrit(e) avec succès !`,
        child_id: newChild.id
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
