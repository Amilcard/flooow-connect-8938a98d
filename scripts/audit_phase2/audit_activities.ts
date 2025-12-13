
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// ARCHIVE TOOL - utilise le projet Supabase actuel Flooow
const supabaseUrl = "https://kbrgwezkjaakoecispom.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZGx6bHRodHd1d3h4cnJieHVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzI3MjEsImV4cCI6MjA3NTg0ODcyMX0.G19gvS7x4tYgtRPKbq7njqG_5OAo0bTYO9O0_fNRlyM"; 

const supabase = createClient(supabaseUrl, supabaseKey);

// Plages de vacances (Source: User JSON Step 1878)
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

async function auditActivities() {
  console.log("🔍 Démarrage de l'audit des activités mixtes...");

  // 1. Récupérer toutes les activités
  const { data: activities, error: actError } = await supabase
    .from('activities')
    .select('id, title');

  if (actError) {
    console.error("❌ Erreur Supabase (Activities):", actError);
    return;
  }

  // 2. Récupérer toutes les sessions (Tentative 1: activity_sessions)
  let allSessions: any[] = [];
  let tableName = 'activity_sessions';
  let dateCol = 'start_date';

  const { data: sessData1, error: sessError1 } = await supabase
    .from('activity_sessions')
    .select('activity_id, start_date');

  if (!sessError1 && sessData1) {
    console.log("✅ Table 'activity_sessions' trouvée.");
    allSessions = sessData1;
  } else {
    console.warn("⚠️ 'activity_sessions' introuvable, tentative avec 'availability_slots'...");
    const { data: sessData2, error: sessError2 } = await supabase
      .from('availability_slots')
      .select('activity_id, start'); // Note: 'start' might be the column name here

    if (sessError2) {
      console.error("❌ Impossible de récupérer les sessions (ni activity_sessions, ni availability_slots).");
      console.error("Erreur 1:", sessError1);
      console.error("Erreur 2:", sessError2);
      return;
    }
    console.log("✅ Table 'availability_slots' trouvée.");
    allSessions = sessData2?.map((s: any) => ({ activity_id: s.activity_id, start_date: s.start })) || [];
    tableName = 'availability_slots';
  }

  console.log(`📋 ${activities.length} activités et ${allSessions.length} sessions récupérées.`);

  const mixedActivities: any[] = [];

  // 3. Analyser chaque activité
  for (const activity of activities) {
    const sessions = allSessions.filter((s: any) => s.activity_id === activity.id);
    if (sessions.length === 0) continue;

    let hasSchool = false;
    let hasVacation = false;
    const schoolDates: string[] = [];
    const vacationDates: string[] = [];

    for (const session of sessions) {
      const dateStr = session.start_date;
      if (isVacation(dateStr)) {
        hasVacation = true;
        vacationDates.push(dateStr);
      } else {
        hasSchool = true;
        schoolDates.push(dateStr);
      }
    }

    // 3. Détecter le mélange
    if (hasSchool && hasVacation) {
      mixedActivities.push({
        id: activity.id,
        title: activity.title,
        schoolDates: schoolDates.sort(),
        vacationDates: vacationDates.sort()
      });
    }
  }

  // 4. Rapport
  console.log("\n🚨 RÉSULTAT DE L'AUDIT : ACTIVITÉS MIXTES DÉTECTÉES 🚨");
  if (mixedActivities.length === 0) {
    console.log("✅ Aucune activité mixte détectée. Tout est cohérent !");
  } else {
    console.log(`⚠️  ${mixedActivities.length} activités incohérentes trouvées :\n`);
    mixedActivities.forEach(act => {
      console.log(`🔸 [${act.title}] (ID: ${act.id})`);
      console.log(`   - 🏫 Sessions Scolaires (${act.schoolDates.length}): ${act.schoolDates.join(', ')}`);
      console.log(`   - 🏖️ Sessions Vacances (${act.vacationDates.length}): ${act.vacationDates.join(', ')}`);
      console.log("   👉 Solution : Scinder en 2 activités distinctes.\n");
    });
  }
}

auditActivities();
