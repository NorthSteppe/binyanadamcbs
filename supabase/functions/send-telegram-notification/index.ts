import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  if (!TELEGRAM_API_KEY) {
    return new Response(JSON.stringify({ error: "TELEGRAM_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // --- Auth check: require a valid JWT ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Allow DB-trigger / system calls made with the service-role key, or verify as a user JWT.
  const isServiceCall = token === SUPABASE_SERVICE_ROLE_KEY;
  let callerId: string | null = null;

  if (!isServiceCall) {
    const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    callerId = userData.user.id;
  }

  try {
    const { user_id, title, message, link } = await req.json();

    if (!user_id || !title) {
      return new Response(JSON.stringify({ error: "Missing user_id or title" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // System calls (service-role key from DB triggers) are fully trusted.
    // User calls may only send to themselves unless they are admin or team_member.
    if (!isServiceCall && callerId && user_id !== callerId) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", callerId);
      const callerRoles = (roles || []).map((r: any) => r.role);
      if (!callerRoles.includes("admin") && !callerRoles.includes("team_member")) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get user's telegram_chat_id from profile_secrets
    const { data: secrets, error: secretsError } = await supabase
      .from("profile_secrets")
      .select("telegram_chat_id")
      .eq("user_id", user_id)
      .single();

    // Get user's name from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user_id)
      .single();

    if (secretsError || !secrets?.telegram_chat_id) {
      return new Response(
        JSON.stringify({ sent: false, reason: "No Telegram chat ID configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build message text
    const icon = title.includes("Session") ? "📅" : title.includes("Message") ? "💬" : title.includes("Task") ? "✅" : "🔔";
    let text = `${icon} <b>${escapeHtml(title)}</b>\n\n${escapeHtml(message || "")}`;
    if (link) {
      text += `\n\n<a href="https://bacbs.com${link}">View in app →</a>`;
    }

    // Build inline keyboard — deep link into relevant section + quick-check buttons
    const appUrl = link ? `https://bacbs.com${link}` : "https://bacbs.com/portal";
    const replyMarkup = {
      inline_keyboard: [
        [{ text: `${icon} Open in App`, url: appUrl }],
        [
          { text: "📅 Sessions", callback_data: "cmd:sessions" },
          { text: "✅ Tasks",    callback_data: "cmd:tasks"    },
          { text: "📊 Status",   callback_data: "cmd:status"   },
        ],
      ],
    };

    // Send via Telegram gateway
    const response = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: secrets.telegram_chat_id,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: replyMarkup,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Telegram API error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ sent: false, error: `Telegram error [${response.status}]` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ sent: true, message_id: data.result?.message_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
