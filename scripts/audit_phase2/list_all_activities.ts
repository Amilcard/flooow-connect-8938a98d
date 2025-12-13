import { createClient } from '@supabase/supabase-js';

// ARCHIVE TOOL - utilise le projet Supabase actuel Flooow
const supabaseUrl = "https://kbrgwezkjaakoecispom.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZGx6bHRodHd1d3h4cnJieHVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzI3MjEsImV4cCI6MjA3NTg0ODcyMX0.G19gvS7x4tYgtRPKbq7njqG_5OAo0bTYO9O0_fNRlyM";

const supabase = createClient(supabaseUrl, supabaseKey);

// Plages de vacances (Zone A)
const VACATION_RANGES = [
  { name: "Automne 2025", start: "2025-10-18", end: "2025-11-03" },
  { name: "Fin d'année 2025", start: "2025-12-20", end: "2026-01-05" },
  { name: "Hiver 2026", start: "2026-02-21", end: "2026-03-09" },
  { name: "Printemps 2026", start: "2026-04-18", end: "2026-05-04" },
  { name: "Été 2026", start: "2026-07-04", end: "2026-09-01" },
  { name: "Automne 2026", start: "2026-10-17", end: "2026-11-02" },
  { name: "Fin d'année 2026", start: "2026-12-19", end: "2027-01-05" }
];

function isVacation(dateStr: string): boolean {
  const date = new Date(dateStr);
  return VACATION_RANGES.some(range => {
    const start = new Date(range.start);
    const end = new Date(range.end);
    return date >= start && date <= end;
  });
}

async function listAllActivities() {
  console.log("📋 Récupération de toutes les activités...\n");

  // Récupérer toutes les activités
  const { data: activities, error: actError } = await supabase
    .from('activities')
    .select('*')
    .order('title');

  if (actError) {
    console.error("❌ Erreur:", actError);
    return;
  }

  // Récupérer toutes les sessions
  const { data: allSessions, error: sessError } = await supabase
    .from('availability_slots')
    .select('activity_id, start');

  if (sessError) {
    console.error("❌ Erreur sessions:", sessError);
    return;
  }

  console.log(`✅ ${activities.length} activités trouvées\n`);
  console.log("=" .repeat(120));

  // Analyser chaque activité
  for (const activity of activities) {
    const sessions = allSessions.filter((s: any) => s.activity_id === activity.id);
    
    // Classifier les sessions
    let schoolCount = 0;
    let vacationCount = 0;
    const dates: string[] = [];

    for (const session of sessions) {
      const dateStr = session.start;
      dates.push(dateStr.split('T')[0]);
      if (isVacation(dateStr)) {
        vacationCount++;
      } else {
        schoolCount++;
      }
    }

    // Déterminer la période dominante
    let periodType = "MIXTE ⚠️";
    if (vacationCount === 0 && schoolCount > 0) periodType = "SCOLAIRE 🏫";
    else if (schoolCount === 0 && vacationCount > 0) periodType = "VACANCES 🏖️";

    // Affichage
    console.log(`\n📌 ${activity.title}`);
    console.log(`   ID: ${activity.id}`);
    console.log(`   Prix: ${activity.price_base || 'N/A'}€`);
    console.log(`   Catégories: ${activity.categories?.join(', ') || 'N/A'}`);
    console.log(`   Organisateur: ${activity.organizer_name || 'N/A'}`);
    console.log(`   Lieu: ${activity.location_name || 'N/A'}`);
    console.log(`   Période: ${periodType}`);
    console.log(`   Sessions: ${sessions.length} total (${schoolCount} scolaires, ${vacationCount} vacances)`);
    
    if (sessions.length > 0 && sessions.length <= 10) {
      console.log(`   Dates: ${dates.sort().join(', ')}`);
    } else if (sessions.length > 10) {
      console.log(`   Premières dates: ${dates.sort().slice(0, 5).join(', ')}...`);
    }
    
    console.log("-".repeat(120));
  }

  console.log(`\n✅ Total: ${activities.length} activités`);
}

listAllActivities();
