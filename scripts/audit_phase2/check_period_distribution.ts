// ============================================================================
// ARCHIVE / OUTIL D'AUDIT - NE PAS MODIFIER SANS BESOIN PRÉCIS
// Projet Flooow - URL: https://kbrgwezkjaakoecispom.supabase.co
// ⚠️ À exécuter manuellement: npx ts-node scripts/audit_phase2/check_period_distribution.ts
// ============================================================================

import { supabase } from './lib/supabase-client';

async function checkPeriodDistribution() {
  console.log("Checking period_type distribution...");

  // Fetch all activities
  const { data, error } = await supabase
    .from("activities")
    .select("period_type");

  if (error) {
    console.error("Error fetching activities:", error);
    return;
  }

  const distribution: Record<string, number> = {};
  let nullCount = 0;

  data.forEach((activity: any) => {
    const type = activity.period_type;
    if (type === null) {
      nullCount++;
    } else {
      distribution[type] = (distribution[type] || 0) + 1;
    }
  });

  console.log("Distribution:");
  console.log(JSON.stringify(distribution, null, 2));
  console.log("NULL values:", nullCount);
  console.log("Total activities:", data.length);
}

checkPeriodDistribution();
