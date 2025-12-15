// ARCHIVE TOOL - utilise le projet Supabase actuel Flooow
import { supabase } from './lib/supabase-client';

async function fixSpringDates() {
  console.log("Fixing Spring 2026 dates...");

  // 1. Find activities with "Vacances" in title
  const { data: activities, error } = await supabase
    .from('activities')
    .select(`
      id,
      title,
      availability_slots (
        id,
        start
      )
    `)
    .ilike('title', '%Vacances%')
    .not('availability_slots', 'is', null);

  if (error) {
    console.error("Error fetching activities:", error);
    return;
  }

  let updateCount = 0;

  for (const activity of activities) {
    if (!activity.availability_slots) continue;

    for (const slot of activity.availability_slots) {
      const date = new Date(slot.start);
      
      // Check if date is in April 2026 but BEFORE the 18th (start of vacation)
      if (date.getFullYear() === 2026 && date.getMonth() === 3 && date.getDate() < 18) {
        console.log(`Found misclassified slot for "${activity.title}": ${slot.start}`);
        
        // Shift date by +14 days (2 weeks) to land in vacation period
        // 5th -> 19th (Vacation)
        // 12th -> 26th (Vacation)
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + 14);
        const newDateStr = newDate.toISOString();

        console.log(`  -> Moving to: ${newDateStr}`);

        // Update in DB
        const { error: updateError } = await supabase
          .from('availability_slots')
          .update({ start: newDateStr })
          .eq('id', slot.id);

        if (updateError) {
          console.error("  Error updating slot:", updateError);
        } else {
          // Verify update
          const { data: verifyData } = await supabase
            .from('availability_slots')
            .select('start')
            .eq('id', slot.id)
            .single();
          
          if (verifyData?.start === newDateStr) {
             console.log("  ✅ Update verified!");
             updateCount++;
          } else {
             console.error("  ❌ Update failed silently (RLS?) - Current: " + verifyData?.start);
          }
        }
      }
    }
  }

  console.log(`\nDone! Updated ${updateCount} slots.`);
}

fixSpringDates();
