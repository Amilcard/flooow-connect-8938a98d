// ============================================================================
// ARCHIVE / OUTIL D'AUDIT - NE PAS MODIFIER SANS BESOIN PRÉCIS
// Projet Flooow - URL: https://kbrgwezkjaakoecispom.supabase.co
// ⚠️ À exécuter manuellement: npx ts-node scripts/audit_phase2/check_activity_aids.ts
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
