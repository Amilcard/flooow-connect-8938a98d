/**
 * Script de correction des dates de fin pour les colonies de vacances
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Lire .env manuellement
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) envVars[key.trim()] = vals.join('=').trim();
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY requises dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeColonies() {
  console.log('🔍 Analyse des colonies de vacances...\n');

  // Récupérer les activités de type colonie/séjour
  const { data: activities, error: actError } = await supabase
    .from('activities')
    .select('id, title, price, period_type, category')
    .or('title.ilike.%colonie%,title.ilike.%séjour%,title.ilike.%camp%');

  if (actError) {
    console.error('Erreur:', actError);
    return;
  }

  console.log(`📋 ${activities?.length || 0} colonies/séjours trouvés\n`);

  const results: any[] = [];

  for (const activity of activities || []) {
    // Récupérer les sessions
    const { data: sessions, error: sessError } = await supabase
      .from('activity_sessions')
      .select('id, start_date, end_date')
      .eq('activity_id', activity.id)
      .order('start_date');

    if (sessError) {
      console.error(`Erreur sessions pour ${activity.title}:`, sessError);
      continue;
    }

    const sessionsWithMissingEnd = sessions?.filter(s => s.start_date && !s.end_date) || [];
    
    // Durée standard : 7 jours pour colonies
    const duree = 7;

    const sessionsData = (sessions || []).map(s => {
      let endDateCalculated: string | undefined;
      
      if (s.start_date && !s.end_date) {
        const startDate = new Date(s.start_date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duree);
        endDateCalculated = endDate.toISOString().split('T')[0];
      }

      return {
        id: s.id,
        start_date: s.start_date,
        end_date: s.end_date,
        end_date_calculated: endDateCalculated
      };
    });

    results.push({
      id: activity.id,
      nom: activity.title,
      prix: activity.price ? `${activity.price}€` : 'N/A',
      periode: activity.period_type || 'vacances',
      category: activity.category || 'Loisirs',
      sessions: sessionsData,
      sessions_sans_date_fin: sessionsWithMissingEnd.length,
      duree_standard: duree
    });

    if (sessionsWithMissingEnd.length > 0) {
      console.log(`⚠️  ${activity.title}`);
      console.log(`   Sessions sans date fin: ${sessionsWithMissingEnd.length}/${sessions?.length || 0}`);
    } else {
      console.log(`✅ ${activity.title} - OK`);
    }
  }

  // Export JSON
  const output = {
    generated_at: new Date().toISOString(),
    total_colonies: results.length,
    colonies_a_corriger: results.filter(r => r.sessions_sans_date_fin > 0).length,
    duree_standard_jours: 7,
    colonies: results.map(c => ({
      id: c.id,
      nom: c.nom,
      prix: c.prix,
      periode: c.periode,
      sessions_total: c.sessions.length,
      sessions_sans_date_fin: c.sessions_sans_date_fin,
      dates_debut: c.sessions.map((s: any) => s.start_date).filter(Boolean),
      dates_fin_calculees: c.sessions.map((s: any) => s.end_date_calculated || s.end_date).filter(Boolean),
      duree_jours: c.duree_standard
    }))
  };

  console.log('\n📊 Résumé:');
  console.log(`   Total colonies/séjours: ${results.length}`);
  console.log(`   À corriger: ${results.filter(r => r.sessions_sans_date_fin > 0).length}`);
  console.log(`   Sessions à mettre à jour: ${results.reduce((acc, c) => acc + c.sessions_sans_date_fin, 0)}`);

  // Sauvegarder JSON
  fs.writeFileSync('colonies-dates-fix.json', JSON.stringify(output, null, 2));
  console.log('\n✅ Export sauvegardé: colonies-dates-fix.json');

  // Générer SQL
  let sqlUpdates = '-- Corrections dates de fin colonies\n-- Généré le ' + new Date().toISOString() + '\n\n';
  let updateCount = 0;
  
  for (const colony of results) {
    for (const session of colony.sessions) {
      if (session.end_date_calculated) {
        sqlUpdates += `UPDATE activity_sessions SET end_date = '${session.end_date_calculated}' WHERE id = '${session.id}';\n`;
        updateCount++;
      }
    }
  }
  
  if (updateCount > 0) {
    fs.writeFileSync('colonies-dates-fix.sql', sqlUpdates);
    console.log(`✅ SQL sauvegardé: colonies-dates-fix.sql (${updateCount} updates)`);
  } else {
    console.log('ℹ️  Aucune correction SQL nécessaire');
  }
}

analyzeColonies().catch(console.error);
