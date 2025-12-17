// ============================================================================
// ARCHIVE / OUTIL D'AUDIT - NE PAS MODIFIER SANS BESOIN PRÉCIS
// Projet Flooow - Uses SUPABASE_URL from environment
// ⚠️ À exécuter manuellement: npx ts-node scripts/audit_phase2/check_activity_aids.ts
// ============================================================================

import { supabase } from './lib/supabase-client';

async function findActivityWithAids() {
  console.log('Searching for activity with aids...');
  const { data, error } = await supabase
    .from('activities')
    .select('id, title, accepts_aid_types, price_base')
    .not('accepts_aid_types', 'is', null)
    .limit(5);

  if (error) {
    console.error('Error fetching activities:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Found activities with aids:');
    data.forEach(activity => {
      console.log(`- ID: ${activity.id}`);
      console.log(`  Title: ${activity.title}`);
      console.log(`  Price: ${activity.price_base}`);
      console.log(`  Aids: ${JSON.stringify(activity.accepts_aid_types)}`);
      console.log('---');
    });
  } else {
    console.log('No activities found with accepts_aid_types.');
  }
}

findActivityWithAids();
