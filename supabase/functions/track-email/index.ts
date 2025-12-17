import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Pixel transparent 1x1
const TRACKING_PIXEL = Uint8Array.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
  0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
  0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
  0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
]);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "opened"; // 'opened' or 'clicked'
    const eventId = url.searchParams.get("event_id");
    const userId = url.searchParams.get("user_id");
    const notificationId = url.searchParams.get("notification_id");

    if (!eventId || !userId) {
      console.error("Missing required parameters");
      // Return tracking pixel anyway to avoid breaking email rendering
      return new Response(TRACKING_PIXEL, {
        headers: {
          ...corsHeaders,
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // Get user agent and IP
    const userAgent = req.headers.get("user-agent") || null;
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;

    // Insert tracking data
    const { error } = await supabase.from("email_tracking").insert({
      event_id: eventId,
      user_id: userId,
      notification_id: notificationId || null,
      action_type: action,
      user_agent: userAgent,
      ip_address: ipAddress,
      tracked_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[track-email] Error inserting tracking data");
    } else {
      console.log("[track-email] Tracking event recorded successfully");
    }

    // For 'opened' action, return tracking pixel
    if (action === "opened") {
      return new Response(TRACKING_PIXEL, {
        headers: {
          ...corsHeaders,
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // For 'clicked' action, redirect to event page
    const redirectUrl = url.searchParams.get("redirect") || `${supabaseUrl.replace("supabase.co", "flooow-connect.fr")}/agenda-community`;
    return Response.redirect(redirectUrl, 302);
  } catch (error: unknown) {
    console.error("[track-email] Internal error");
    // Always return tracking pixel on error to avoid breaking emails
    return new Response(TRACKING_PIXEL, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/gif",
      },
    });
  }
};

serve(handler);
