import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventReminderData {
  user_id: string;
  user_email: string;
  event_id: string;
  event_title: string;
  event_start_date: string;
  event_location: string;
  days_before: number;
  send_email: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting event reminders check...");

    // Récupérer tous les utilisateurs avec leurs préférences de rappels actives
    const { data: usersWithPrefs, error: prefsError } = await supabase
      .from("notification_preferences")
      .select("user_id, event_reminders_enabled, event_reminder_days_before, event_reminder_email")
      .eq("event_reminders_enabled", true);

    if (prefsError) {
      console.error("Error fetching preferences:", prefsError);
      throw prefsError;
    }

    console.log(`Found ${usersWithPrefs?.length || 0} users with reminders enabled`);

    let remindersProcessed = 0;
    let emailsSent = 0;
    let notificationsCreated = 0;

    // Pour chaque utilisateur
    for (const userPref of usersWithPrefs || []) {
      // Récupérer leurs événements favoris
      const { data: favoriteEvents, error: favError } = await supabase
        .from("favorite_events")
        .select(`
          event_id,
          territory_events (
            id,
            title,
            start_date,
            location
          )
        `)
        .eq("user_id", userPref.user_id);

      if (favError) {
        console.error(`Error fetching favorites for user ${userPref.user_id}:`, favError);
        continue;
      }

      // Récupérer l'email de l'utilisateur
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userPref.user_id)
        .single();

      if (!profile?.email) {
        console.log(`No email found for user ${userPref.user_id}`);
        continue;
      }

      // Pour chaque événement favori
      for (const favorite of favoriteEvents || []) {
        const event = favorite.territory_events as { id: string; title: string; start_date: string; location?: string } | null;
        if (!event || Array.isArray(event)) continue;

        const eventDate = new Date(event.start_date);
        const now = new Date();
        const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Vérifier si on doit envoyer un rappel
        if (daysUntilEvent === userPref.event_reminder_days_before) {
          // Vérifier qu'on n'a pas déjà envoyé ce rappel
          const { data: alreadySent } = await supabase
            .from("event_reminders_sent")
            .select("id")
            .eq("user_id", userPref.user_id)
            .eq("event_id", event.id)
            .eq("days_before", userPref.event_reminder_days_before)
            .maybeSingle();

          if (alreadySent) {
            console.log(`Reminder already sent for event ${event.id} to user ${userPref.user_id}`);
            continue;
          }

          console.log(`Sending reminder for event "${event.title}" to user ${userPref.user_id}`);

          // Créer la notification in-app d'abord pour obtenir l'ID
          const { data: notificationData, error: notificationError } = await supabase
            .from("notifications")
            .insert({
              user_id: userPref.user_id,
              type: "event_reminder",
              title: `Rappel : ${event.title}`,
              message: `L'événement "${event.title}" commence dans ${userPref.event_reminder_days_before} jour${userPref.event_reminder_days_before > 1 ? "s" : ""}`,
              payload: {
                event_id: event.id,
                event_title: event.title,
                event_start_date: event.start_date,
                event_location: event.location,
                days_before: userPref.event_reminder_days_before,
              },
              read: false,
            })
            .select()
            .single();

          if (!notificationError) {
            notificationsCreated++;
            
            // Marquer comme envoyé
            await supabase
              .from("event_reminders_sent")
              .insert({
                user_id: userPref.user_id,
                event_id: event.id,
                reminder_type: "notification",
                days_before: userPref.event_reminder_days_before,
              });
          }

          // Envoyer un email si demandé
          if (userPref.event_reminder_email && notificationData) {
            try {
              const eventDateFormatted = new Date(event.start_date).toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              // Générer les URLs de tracking
              const trackingPixelUrl = `${supabaseUrl}/functions/v1/track-email?action=opened&event_id=${event.id}&user_id=${userPref.user_id}&notification_id=${notificationData.id}`;
              const trackingLinkUrl = `${supabaseUrl}/functions/v1/track-email?action=clicked&event_id=${event.id}&user_id=${userPref.user_id}&notification_id=${notificationData.id}&redirect=${supabaseUrl.replace("supabase.co", "flooow-connect.fr")}/agenda-community`;

              await resend.emails.send({
                from: "Flooow Connect <notifications@flooow-connect.fr>",
                to: [profile.email],
                subject: `Rappel : ${event.title} dans ${userPref.event_reminder_days_before} jour${userPref.event_reminder_days_before > 1 ? "s" : ""}`,
                html: `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Rappel d'événement</h1>
                        </div>
                        
                        <div style="padding: 30px; background-color: #ffffff;">
                          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                            Bonjour,<br><br>
                            Vous avez marqué cet événement comme favori et il commence dans <strong>${userPref.event_reminder_days_before} jour${userPref.event_reminder_days_before > 1 ? "s" : ""}</strong> !
                          </p>
                          
                          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h2 style="color: #333; margin-top: 0;">${event.title}</h2>
                            <p style="color: #666; margin: 10px 0;">
                              <strong>📅 Date :</strong> ${eventDateFormatted}
                            </p>
                            ${event.location ? `
                              <p style="color: #666; margin: 10px 0;">
                                <strong>📍 Lieu :</strong> ${event.location}
                              </p>
                            ` : ""}
                          </div>
                          
                          <div style="text-align: center; margin-top: 30px;">
                            <a href="${trackingLinkUrl}" 
                               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
                              Voir l'événement
                            </a>
                          </div>
                          
                          <p style="margin-top: 30px;">N'oubliez pas de vous préparer !</p>
                          <p>À bientôt,<br>L'équipe Flooow Connect</p>
                        </div>

                        <div style="padding: 20px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 10px 10px;">
                          <p style="margin: 0; color: #666; font-size: 12px;">
                            Vous recevez cet email car vous avez activé les rappels par email.<br>
                            <a href="${supabaseUrl.replace("supabase.co", "flooow-connect.fr")}/account/mes-notifications" style="color: #667eea;">Gérer mes préférences</a>
                          </p>
                        </div>
                      </div>
                      <!-- Pixel de tracking invisible -->
                      <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
                    </body>
                  </html>
                `,
              });

              emailsSent++;

              // Marquer l'email comme envoyé
              await supabase
                .from("event_reminders_sent")
                .insert({
                  user_id: userPref.user_id,
                  event_id: event.id,
                  reminder_type: "email",
                  days_before: userPref.event_reminder_days_before,
                });

            } catch (emailError) {
              console.error(`Error sending email to ${profile.email}:`, emailError);
            }
          }

          remindersProcessed++;
        }
      }
    }

    console.log(`Reminders check complete: ${remindersProcessed} processed, ${notificationsCreated} notifications, ${emailsSent} emails`);

    return new Response(
      JSON.stringify({
        success: true,
        reminders_processed: remindersProcessed,
        notifications_created: notificationsCreated,
        emails_sent: emailsSent,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: unknown) {
    console.error("[event-reminders] Internal error");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
