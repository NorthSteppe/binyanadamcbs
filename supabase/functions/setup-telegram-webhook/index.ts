// One-time setup: registers the telegram-webhook edge function URL with Telegram.
// Called from the admin UI — no Supabase dashboard needed.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

  if (!TELEGRAM_API_KEY) {
    return new Response(
      JSON.stringify({ ok: false, error: "TELEGRAM_API_KEY not set in Supabase secrets" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!SUPABASE_URL) {
    return new Response(
      JSON.stringify({ ok: false, error: "SUPABASE_URL not set" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Derive the project ref from the Supabase URL
  // e.g. https://wcqjmjceelcainyyqjmi.supabase.co → wcqjmjceelcainyyqjmi
  const projectRef = SUPABASE_URL.replace("https://", "").split(".")[0];
  const webhookUrl = `https://${projectRef}.supabase.co/functions/v1/telegram-webhook`;

  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_API_KEY}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    },
  );

  const data = await res.json();

  return new Response(
    JSON.stringify({ ok: data.ok, description: data.description, webhookUrl }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
