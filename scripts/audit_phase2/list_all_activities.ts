// ARCHIVE TOOL - utilise le projet Supabase actuel Flooow
import { supabase } from './lib/supabase-client';
import { isVacation } from './lib/vacation-ranges';

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
