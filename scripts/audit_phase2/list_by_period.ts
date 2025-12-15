// ARCHIVE TOOL - utilise le projet Supabase actuel Flooow
import { supabase } from './lib/supabase-client';
import { isVacation } from './lib/vacation-ranges';

async function listActivitiesByPeriod() {
  console.log("📋 Classification des activités par période...\n");

  const { data: activities, error: actError } = await supabase
    .from('activities')
    .select('id, title, price_base, categories');

  if (actError) {
    console.error("❌ Erreur:", actError);
    return;
  }

  const { data: allSessions, error: sessError } = await supabase
    .from('availability_slots')
    .select('activity_id, start');

  if (sessError) {
    console.error("❌ Erreur sessions:", sessError);
    return;
  }

  // Classifier les activités
  const scolaire: any[] = [];
  const vacances: any[] = [];
  const mixte: any[] = [];

  for (const activity of activities) {
    const sessions = allSessions.filter((s: any) => s.activity_id === activity.id);
    if (sessions.length === 0) continue;

    let schoolCount = 0;
    let vacationCount = 0;

    for (const session of sessions) {
      if (isVacation(session.start)) {
        vacationCount++;
      } else {
        schoolCount++;
      }
    }

    const activityInfo = {
      title: activity.title,
      price: activity.price_base || 'N/A',
      categories: activity.categories?.join(', ') || 'N/A',
      sessions: sessions.length
    };

    if (vacationCount === 0 && schoolCount > 0) {
      scolaire.push(activityInfo);
    } else if (schoolCount === 0 && vacationCount > 0) {
      vacances.push(activityInfo);
    } else {
      mixte.push({ ...activityInfo, schoolCount, vacationCount });
    }
  }

  // Affichage par période
  console.log("=" .repeat(100));
  console.log("🏫 ACTIVITÉS PÉRIODE SCOLAIRE");
  console.log("=" .repeat(100));
  console.log(`Total: ${scolaire.length} activités\n`);
  
  const uniqueScolaire = Array.from(new Map(scolaire.map(a => [a.title, a])).values());
  uniqueScolaire.forEach(a => {
    console.log(`• ${a.title} - ${a.price}€ (${a.categories})`);
  });

  console.log("\n" + "=" .repeat(100));
  console.log("🏖️ ACTIVITÉS PÉRIODE VACANCES");
  console.log("=" .repeat(100));
  console.log(`Total: ${vacances.length} activités\n`);
  
  const uniqueVacances = Array.from(new Map(vacances.map(a => [a.title, a])).values());
  uniqueVacances.forEach(a => {
    console.log(`• ${a.title} - ${a.price}€ (${a.categories})`);
  });

  console.log("\n" + "=" .repeat(100));
  console.log("⚠️ ACTIVITÉS MIXTES (À CORRIGER)");
  console.log("=" .repeat(100));
  console.log(`Total: ${mixte.length} activités\n`);
  
  const uniqueMixte = Array.from(new Map(mixte.map(a => [a.title, a])).values());
  uniqueMixte.forEach(a => {
    console.log(`• ${a.title} - ${a.price}€ (${a.categories})`);
    console.log(`  → ${a.schoolCount} sessions scolaires, ${a.vacationCount} sessions vacances`);
  });

  console.log("\n" + "=" .repeat(100));
  console.log("📊 RÉSUMÉ");
  console.log("=" .repeat(100));
  console.log(`Activités scolaires: ${uniqueScolaire.length}`);
  console.log(`Activités vacances: ${uniqueVacances.length}`);
  console.log(`Activités mixtes: ${uniqueMixte.length}`);
  console.log(`TOTAL: ${uniqueScolaire.length + uniqueVacances.length + uniqueMixte.length} activités distinctes`);
}

listActivitiesByPeriod();
