import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const url = new URL(req.url);
    const bookingId = url.pathname.split('/').filter(Boolean).pop();
    const { action } = await req.json();

    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single();

    if (!booking) throw new Error('Booking not found');

    const newStatus = action === 'accept' ? 'validee' : 'refusee';
    await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    await supabase.from('validations_parentales').insert({
      booking_id: bookingId,
      parent_id: user.id,
      status: newStatus,
      validated_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, status: newStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
