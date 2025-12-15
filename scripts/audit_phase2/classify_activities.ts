// ARCHIVE TOOL - utilise le projet Supabase actuel Flooow
import { supabase } from './lib/supabase-client';
import { isVacation } from './lib/vacation-ranges';

// --- CONFIGURATION ---

const AIDES_SCOLAIRE = ["CAF", "Ville", "Pass'Sport", "Pass Culture"];
const AIDES_VACANCES = ["CAF", "Ville", "ANCV", "Pass'Vacances"];

async function classifyActivities() {
  console.log("Fetching activities and sessions...");

  // Fetch activities with their sessions (corrigé: activity_sessions au lieu de availability_slots)
  const { data: activities, error } = await supabase
    .from('activities')
    .select(`
      id,
      title,
      activity_sessions (
        start_date
      )
    `)
    .not('activity_sessions', 'is', null);

  if (error) {
    console.error("Error fetching activities:", error);
    return;
  }

  const results: any[] = [];

  activities.forEach((activity: any) => {
    if (!activity.activity_sessions || activity.activity_sessions.length === 0) {
      return; // Skip activities without dates
    }

    // For each session, classify it
    activity.activity_sessions.forEach((session: any) => {
      const dateStr = session.start_date.split('T')[0]; // Extract YYYY-MM-DD
      const isVacationPeriod = isVacation(dateStr);
      const periode = isVacationPeriod ? 'vacances' : 'scolaire';
      const aides = isVacationPeriod ? AIDES_VACANCES : AIDES_SCOLAIRE;

      results.push({
        nom_activite: activity.title,
        date: dateStr,
        periode: periode,
        aides_eligibles: aides
      });
    });
  });

  // Output results
  console.log(JSON.stringify(results, null, 2));
  console.log(`\nTotal classified sessions: ${results.length}`);
}

classifyActivities();
