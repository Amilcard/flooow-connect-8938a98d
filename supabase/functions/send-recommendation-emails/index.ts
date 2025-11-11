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

interface RecommendedEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_date: string;
  end_date: string;
  location: string | null;
  territory_name: string;
  recommendation_reason: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting recommendation email job...");

    // Récupérer tous les utilisateurs qui ont activé les emails de recommandations
    const { data: users, error: usersError } = await supabase
      .from("notification_preferences")
      .select("user_id, recommendation_emails")
      .eq("recommendation_emails", true);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log("No users with recommendation emails enabled");
      return new Response(
        JSON.stringify({ success: true, message: "No users to process", emails_sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log(`Found ${users.length} users with recommendation emails enabled`);

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const user of users) {
      try {
        // Récupérer les recommandations pour cet utilisateur
        const { data: recommendations, error: recsError } = await supabase
          .rpc("get_recommended_events", {
            p_user_id: user.user_id,
            p_limit: 5,
          });

        if (recsError) {
          console.error(`Error fetching recommendations for user ${user.user_id}:`, recsError);
          continue;
        }

        if (!recommendations || recommendations.length === 0) {
          console.log(`No recommendations for user ${user.user_id}`);
          continue;
        }

        // Récupérer l'email de l'utilisateur
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", user.user_id)
          .single();

        if (profileError || !profile?.email) {
          console.error(`Error fetching profile for user ${user.user_id}:`, profileError);
          continue;
        }

        // Vérifier si un email a déjà été envoyé dans les dernières 24h
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const { data: recentEmail, error: recentEmailError } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", user.user_id)
          .eq("type", "recommendation_email")
          .gte("created_at", oneDayAgo.toISOString())
          .limit(1);

        if (recentEmailError) {
          console.error(`Error checking recent emails for user ${user.user_id}:`, recentEmailError);
          continue;
        }

        if (recentEmail && recentEmail.length > 0) {
          console.log(`Email already sent in the last 24h for user ${user.user_id}`);
          continue;
        }

        // Créer la notification in-app d'abord pour obtenir l'ID
        const { data: notificationData, error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: user.user_id,
            type: "recommendation_email",
            title: "Nouvelles recommandations",
            message: `${recommendations.length} nouveaux événements recommandés vous ont été envoyés par email`,
            payload: { recommendations_count: recommendations.length },
            read: true, // Marqué comme lu car c'est juste un tracker
          })
          .select()
          .single();

        if (notificationError) {
          console.error(`Error creating notification for user ${user.user_id}:`, notificationError);
          continue;
        }

        // Générer les URLs de tracking
        const trackingPixelUrl = `${supabaseUrl}/functions/v1/track-email?action=opened&event_id=${(recommendations as RecommendedEvent[])[0]?.id}&user_id=${user.user_id}&notification_id=${notificationData.id}`;

        // Formater les recommandations pour l'email
        const eventsHtml = (recommendations as RecommendedEvent[])
          .map(
            (event) => {
              const eventTrackingUrl = `${supabaseUrl}/functions/v1/track-email?action=clicked&event_id=${event.id}&user_id=${user.user_id}&notification_id=${notificationData.id}&redirect=${supabaseUrl.replace("supabase.co", "flooow-connect.fr")}/agenda-community`;
              return `
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${event.title}</h3>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">
              <strong>📅 Date:</strong> ${new Date(event.start_date).toLocaleDateString("fr-FR", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </p>
            ${event.location ? `<p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>📍 Lieu:</strong> ${event.location}</p>` : ""}
            <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>🏘️ Territoire:</strong> ${event.territory_name}</p>
            <p style="margin: 10px 0 0 0; padding: 10px; background-color: #e8f4f8; border-radius: 5px; font-size: 13px; color: #0066cc;">
              💡 ${event.recommendation_reason}
            </p>
            ${event.description ? `<p style="margin: 10px 0 0 0; color: #555; font-size: 14px;">${event.description}</p>` : ""}
            <div style="margin-top: 10px;">
              <a href="${eventTrackingUrl}" style="display: inline-block; background-color: #667eea; color: white; padding: 8px 16px; text-decoration: none; border-radius: 5px; font-size: 14px;">
                Voir l'événement
              </a>
            </div>
          </div>
        `;
            }
          )
          .join("");

        // Envoyer l'email
        const emailResponse = await resend.emails.send({
          from: "Flooow Connect <notifications@flooow-connect.fr>",
          to: [profile.email],
          subject: `🎯 ${recommendations.length} nouveaux événements recommandés pour vous`,
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
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Événements recommandés</h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Découvrez ${recommendations.length} événements sélectionnés pour vous</p>
                  </div>
                  
                  <div style="padding: 30px; background-color: #ffffff;">
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                      Bonjour,<br><br>
                      Nous avons trouvé de nouveaux événements qui pourraient vous intéresser, basés sur vos préférences et votre historique :
                    </p>

                    ${eventsHtml}

                    <div style="text-align: center; margin-top: 30px;">
                      <a href="${supabaseUrl.replace("supabase.co", "flooow-connect.fr")}/agenda-community" 
                         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
                        Voir tous les événements
                      </a>
                    </div>
                  </div>

                  <div style="padding: 20px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 10px 10px;">
                    <p style="margin: 0; color: #666; font-size: 12px;">
                      Vous recevez cet email car vous avez activé les recommandations par email.<br>
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

        console.log(`Email sent to ${profile.email}:`, emailResponse);
        emailsSent++;
      } catch (error) {
        console.error(`Failed to send email to user ${user.user_id}:`, error);
        emailsFailed++;
      }
    }

    console.log(`Job completed: ${emailsSent} emails sent, ${emailsFailed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        emails_sent: emailsSent,
        emails_failed: emailsFailed,
        users_processed: users.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in send-recommendation-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);