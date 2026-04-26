// Returns the authorization URL for the requested provider.
// The current user's id is encoded in the OAuth `state` parameter so the
// callback can attribute the returned tokens to the right staff member.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { signState } from "../_shared/oauth-state.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const FUNCTIONS_BASE = `${SUPABASE_URL}/functions/v1`;

const PROVIDER_CONFIG = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    clientIdEnv: "GOOGLE_OAUTH_CLIENT_ID",
    callbackPath: "oauth-google-callback",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "openid",
    ].join(" "),
    extraParams: { access_type: "offline", prompt: "consent" },
  },
  microsoft: {
    authUrl: `https://login.microsoftonline.com/${Deno.env.get("MICROSOFT_OAUTH_TENANT_ID") || "common"}/oauth2/v2.0/authorize`,
    clientIdEnv: "MICROSOFT_OAUTH_CLIENT_ID",
    callbackPath: "oauth-microsoft-callback",
    scope: [
      "offline_access",
      "User.Read",
      "Calendars.ReadWrite",
      "OnlineMeetings.ReadWrite",
    ].join(" "),
    extraParams: { response_mode: "query", prompt: "select_account" },
  },
  zoom: {
    authUrl: "https://zoom.us/oauth/authorize",
    clientIdEnv: "ZOOM_OAUTH_CLIENT_ID",
    callbackPath: "oauth-zoom-callback",
    scope: "meeting:write meeting:write:admin user:read",
    extraParams: {},
  },
} as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabase = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = data.user;
    if (!user) throw new Error("Not authenticated");

    const { provider } = await req.json();
    const cfg = PROVIDER_CONFIG[provider as keyof typeof PROVIDER_CONFIG];
    if (!cfg) throw new Error("Invalid provider");

    const clientId = Deno.env.get(cfg.clientIdEnv);
    if (!clientId) throw new Error(`${provider} OAuth not configured`);

    const redirectUri = `${FUNCTIONS_BASE}/${cfg.callbackPath}`;
    const state = await signState({ user_id: user.id, ts: Date.now() });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: cfg.scope,
      state,
      ...cfg.extraParams,
    });

    return new Response(JSON.stringify({ url: `${cfg.authUrl}?${params.toString()}`, redirect_uri: redirectUri }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
