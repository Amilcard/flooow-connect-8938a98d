import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Récupérer les territoires
    const { data: territories } = await supabaseAdmin
      .from('territories')
      .select('id, name')
      .in('name', ['Territoire Test Paris', 'Territoire Test Lyon', 'Territoire Test Marseille', 'Territoire Test Toulouse']);

    if (!territories || territories.length !== 4) {
      throw new Error('Les 4 territoires de test n\'ont pas été trouvés');
    }

    const testUsers = [
      { email: 'test_paris@inklusif.fr', territory: 'Territoire Test Paris', postal_code: '75001', qf: 1500, marital_status: 'couple' },
      { email: 'test_lyon@inklusif.fr', territory: 'Territoire Test Lyon', postal_code: '69001', qf: 1200, marital_status: 'single' },
      { email: 'test_marseille@inklusif.fr', territory: 'Territoire Test Marseille', postal_code: '13001', qf: 1800, marital_status: 'divorced' },
      { email: 'test_toulouse@inklusif.fr', territory: 'Territoire Test Toulouse', postal_code: '31000', qf: 2000, marital_status: 'couple' },
    ];

    const results = [];
    const password = 'TestBeta2025!';

    for (const testUser of testUsers) {
      const territory = territories.find(t => t.name === testUser.territory);
      if (!territory) continue;

      // Vérifier si l'utilisateur existe déjà
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = existingUser?.users.some(u => u.email === testUser.email);

      if (userExists) {
        console.log(`Utilisateur ${testUser.email} existe déjà`);
        results.push({ email: testUser.email, success: true, already_exists: true });
        continue;
      }

      // Créer l'utilisateur via l'admin API
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: testUser.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          first_name: 'Test',
          last_name: testUser.territory.replace('Territoire Test ', '')
        }
      });

      if (authError) {
        console.error(`Erreur création ${testUser.email}:`, authError);
        results.push({ email: testUser.email, success: false, error: authError.message });
        continue;
      }

      // Mettre à jour le profil avec toutes les informations
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          territory_id: territory.id,
          postal_code: testUser.postal_code,
          quotient_familial: testUser.qf,
          marital_status: testUser.marital_status,
          account_status: 'pending'
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error(`Erreur mise à jour profil ${testUser.email}:`, profileError);
      }

      results.push({
        email: testUser.email,
        success: true,
        user_id: authData.user.id,
        territory: testUser.territory,
        postal_code: testUser.postal_code
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '4 utilisateurs de test créés/vérifiés',
        password: password,
        users: results,
        instructions: [
          'Vous pouvez maintenant vous connecter avec ces identifiants:',
          'test_paris@inklusif.fr / TestBeta2025!',
          'test_lyon@inklusif.fr / TestBeta2025!',
          'test_marseille@inklusif.fr / TestBeta2025!',
          'test_toulouse@inklusif.fr / TestBeta2025!'
        ]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
