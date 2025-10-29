import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Vérifier que RESEND_API_KEY est configurée
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured in Supabase Secrets');
      return new Response(
        JSON.stringify({ error: 'Service d\'email non configuré. Contactez l\'administrateur.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { parentEmail, childName, childDob } = await req.json();

    console.log('Child signup email validation request:', { parentEmail, childName, childDob });

    // Validate input
    if (!parentEmail || !childName || !childDob) {
      return new Response(
        JSON.stringify({ error: 'Email parent, prénom enfant et date de naissance requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que le parent existe et est actif
    const { data: parent, error: parentError } = await supabaseAdmin
      .from('profiles')
      .select('id, account_status')
      .eq('email', parentEmail)
      .maybeSingle();

    if (parentError) {
      console.error('Error checking parent:', parentError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la vérification du compte parent' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!parent) {
      return new Response(
        JSON.stringify({
          error: 'Aucun compte parent trouvé avec cet email. Créez d\'abord un compte parent sur l\'application.'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (parent.account_status !== 'active') {
      return new Response(
        JSON.stringify({
          error: 'Le compte parent doit être validé par un administrateur avant de pouvoir inscrire un enfant.'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit: max 3 requests per email per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentRequests, error: countError } = await supabaseAdmin
      .from('child_signup_requests')
      .select('id', { count: 'exact', head: true })
      .eq('parent_email', parentEmail)
      .gte('created_at', oneDayAgo);

    if (countError) {
      console.error('Error checking rate limit:', countError);
    }

    const requestCount = recentRequests?.length || 0;
    if (requestCount >= 3) {
      return new Response(
        JSON.stringify({ error: 'Limite atteinte : 3 demandes maximum par jour' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for duplicate pending request
    const { data: existingRequest } = await supabaseAdmin
      .from('child_signup_requests')
      .select('id, status')
      .eq('parent_email', parentEmail)
      .eq('child_first_name', childName)
      .eq('child_dob', childDob)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingRequest) {
      return new Response(
        JSON.stringify({ error: 'Une demande est déjà en attente pour cet enfant' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate validation token
    const validationToken = crypto.randomUUID();

    // Create signup request
    const { data: signupRequest, error: requestError } = await supabaseAdmin
      .from('child_signup_requests')
      .insert({
        parent_email: parentEmail,
        child_first_name: childName,
        child_dob: childDob,
        validation_token: validationToken
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating signup request:', requestError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de la demande' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build validation URLs
    const FRONTEND_URL = Deno.env.get('FRONTEND_URL');
    if (!FRONTEND_URL) {
      console.error('FRONTEND_URL not configured in Supabase Secrets');
      return new Response(
        JSON.stringify({ error: 'Configuration serveur manquante (FRONTEND_URL). Contactez l\'administrateur.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validationUrl = `${FRONTEND_URL}/validate-child-signup?token=${validationToken}&action=approve`;
    const rejectUrl = `${FRONTEND_URL}/validate-child-signup?token=${validationToken}&action=reject`;

    // Build email HTML
    const formattedDob = new Date(childDob).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
    h1 { color: #333; font-size: 24px; margin-bottom: 20px; }
    p { color: #333; font-size: 16px; line-height: 26px; margin: 16px 0; }
    .info-box { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 16px; margin: 24px 0; }
    .info-title { color: #495057; font-size: 14px; font-weight: bold; margin: 0 0 8px; }
    .info-text { color: #495057; font-size: 14px; line-height: 22px; margin: 0; }
    .button { display: inline-block; padding: 16px 32px; margin: 8px 0; border-radius: 8px; text-decoration: none; font-weight: bold; text-align: center; width: 100%; box-sizing: border-box; }
    .button-primary { background: #5469d4; color: white; }
    .button-secondary { background: white; border: 2px solid #dc3545; color: #dc3545; }
    .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 12px; border-radius: 4px; font-size: 14px; margin: 24px 0; }
    .expiry { color: #6c757d; font-size: 14px; font-style: italic; margin: 16px 0; }
    .footer { color: #8898aa; font-size: 12px; text-align: center; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎯 Demande d'inscription</h1>
    
    <p>Bonjour,</p>
    
    <p><strong>${childName}</strong> (né(e) le <strong>${formattedDob}</strong>) a demandé à s'inscrire sur InKlusif pour accéder aux activités.</p>

    <div class="info-box">
      <p class="info-title">🔍 Vérifiez l'identité</p>
      <p class="info-text">
        • Prénom : ${childName}<br>
        • Date de naissance : ${formattedDob}
      </p>
    </div>

    <a href="${validationUrl}" class="button button-primary">
      ✅ OUI, C'EST MON ENFANT
    </a>
    
    <a href="${rejectUrl}" class="button button-secondary">
      ❌ NON, REFUSER
    </a>

    <div class="warning">
      ⚠️ Si vous ne reconnaissez pas cette demande, cliquez sur "NON, REFUSER" ou ignorez simplement cet email.
    </div>

    <p class="expiry">Cette demande expirera automatiquement dans 48 heures.</p>

    <p class="footer">
      InKlusif - Activités jeunesse<br>
      Cet email a été envoyé car votre adresse email a été utilisée lors d'une demande d'inscription.
    </p>
  </div>
</body>
</html>
    `;

    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'InKlusif <onboarding@resend.dev>',
        to: [parentEmail],
        subject: `${childName} souhaite s'inscrire sur InKlusif`,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Resend API error:', emailResponse.status, errorData);

      let userMessage = 'Impossible d\'envoyer l\'email';
      let statusCode = emailResponse.status;

      // Gestion d'erreurs détaillée selon le code HTTP de Resend
      switch (emailResponse.status) {
        case 400:
          userMessage = 'L\'adresse email semble invalide';
          break;
        case 401:
        case 403:
          userMessage = 'Service d\'email temporairement indisponible. Veuillez contacter le support.';
          statusCode = 500; // Ne pas exposer les erreurs d'authentification
          break;
        case 429:
          userMessage = 'Trop de demandes d\'envoi d\'emails. Réessayez dans quelques minutes.';
          break;
        case 503:
          userMessage = 'Service d\'email temporairement indisponible. Réessayez plus tard.';
          break;
        default:
          userMessage = `Erreur lors de l\'envoi de l\'email (${emailResponse.status})`;
      }

      return new Response(
        JSON.stringify({ error: userMessage }),
        { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Validation email sent successfully to:', parentEmail);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Un email a été envoyé à ${parentEmail}. Le parent a 48h pour valider.`,
        request_id: signupRequest.id
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
