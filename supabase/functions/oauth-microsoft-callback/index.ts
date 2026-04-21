// Public OAuth callback for Microsoft. Exchanges the auth code for tokens,
// stores them in staff_integrations, and redirects back to the app.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_ORIGIN = "https://bacbs.com";
const TENANT = Deno.env.get("MICROSOFT_OAUTH_TENANT_ID") || "common";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const redirectBack = (status: "ok" | "error", reason?: string) => {
    const target = new URL(`${APP_ORIGIN}/portal/settings`);
    target.searchParams.set("oauth", status);
    target.searchParams.set("provider", "microsoft");
    if (reason) target.searchParams.set("reason", reason);
    return Response.redirect(target.toString(), 302);
  };

  if (error || !code || !stateRaw) return redirectBack("error", error || "missing_code");

  try {
    const state = JSON.parse(atob(stateRaw)) as { user_id: string };
    const callbackUrl = `${SUPABASE_URL}/functions/v1/oauth-microsoft-callback`;

    const tokenRes = await fetch(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get("MICROSOFT_OAUTH_CLIENT_ID")!,
        client_secret: Deno.env.get("MICROSOFT_OAUTH_CLIENT_SECRET")!,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
        scope: "offline_access User.Read Calendars.ReadWrite OnlineMeetings.ReadWrite",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Microsoft token exchange failed:", tokens);
      return redirectBack("error", "token_exchange");
    }

    const meRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const me = await meRes.json();

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    await supabase.from("staff_integrations").upsert({
      user_id: state.user_id,
      provider: "microsoft",
      account_email: me.mail || me.userPrincipalName || "",
      account_name: me.displayName || "",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || "",
      token_expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
      scope: tokens.scope || "",
    }, { onConflict: "user_id,provider" });

    return redirectBack("ok");
  } catch (e) {
    console.error("Microsoft callback error:", e);
    return redirectBack("error", "callback_exception");
  }
});
