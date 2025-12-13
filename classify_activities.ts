
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

// ARCHIVE TOOL - utilise le projet Supabase actuel Flooow
const supabaseUrl = "https://kbrgwezkjaakoecispom.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZGx6bHRodHd1d3h4cnJieHVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzI3MjEsImV4cCI6MjA3NTg0ODcyMX0.G19gvS7x4tYgtRPKbq7njqG_5OAo0bTYO9O0_fNRlyM";

const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONFIGURATION ---

const VACANCES_ZONE_A = [
  { nom: "Vacances Toussaint 2025", debut: "2025-10-18", fin: "2025-11-03" },
  { nom: "Vacances Noël 2025", debut: "2025-12-20", fin: "2026-01-05" },
  { nom: "Vacances Hiver 2026", debut: "2026-02-21", fin: "2026-03-09" },
  { nom: "Vacances Printemps 2026", debut: "2026-04-18", fin: "2026-05-04" },
  { nom: "Vacances Été 2026", debut: "2026-07-04", fin: "2026-09-01" },
  { nom: "Vacances Toussaint 2026", debut: "2026-10-17", fin: "2026-11-02" },
  { nom: "Vacances Noël 2026", debut: "2026-12-19", fin: "2027-01-05" }
];

const AIDES_SCOLAIRE = ["CAF", "Ville", "Pass'Sport", "Pass Culture"];
const AIDES_VACANCES = ["CAF", "Ville", "ANCV", "Pass'Vacances"];

// --- LOGIC ---

function isDateInVacation(dateStr: string): boolean {
  const date = new Date(dateStr);
  return VACANCES_ZONE_A.some(vacance => {
    const start = new Date(vacance.debut);
    const end = new Date(vacance.fin);
    return date >= start && date <= end;
  });
}

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
      const isVacation = isDateInVacation(dateStr);
      const periode = isVacation ? 'vacances' : 'scolaire';
      const aides = isVacation ? AIDES_VACANCES : AIDES_SCOLAIRE;

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
