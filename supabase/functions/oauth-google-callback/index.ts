// Public OAuth callback for Google. Exchanges the auth code for tokens,
// stores them in staff_integrations, and redirects back to the app.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyState } from "../_shared/oauth-state.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_ORIGIN = "https://bacbs.com";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const redirectBack = (status: "ok" | "error", reason?: string) => {
    const target = new URL(`${APP_ORIGIN}/portal/settings`);
    target.searchParams.set("oauth", status);
    target.searchParams.set("provider", "google");
    if (reason) target.searchParams.set("reason", reason);
    return Response.redirect(target.toString(), 302);
  };

  if (error || !code || !stateRaw) return redirectBack("error", error || "missing_code");

  try {
    let state: { user_id: string };
    try {
      state = await verifyState(stateRaw);
    } catch (e) {
      console.error("Google callback state verification failed:", e);
      return redirectBack("error", "invalid_state");
    }
    const callbackUrl = `${SUPABASE_URL}/functions/v1/oauth-google-callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get("GOOGLE_OAUTH_CLIENT_ID")!,
        client_secret: Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET")!,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Google token exchange failed:", tokens);
      return redirectBack("error", "token_exchange");
    }

    // Fetch user info
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userInfo = await userInfoRes.json();

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    await supabase.from("staff_integrations").upsert({
      user_id: state.user_id,
      provider: "google",
      account_email: userInfo.email || "",
      account_name: userInfo.name || "",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || "",
      token_expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
      scope: tokens.scope || "",
    }, { onConflict: "user_id,provider" });

    return redirectBack("ok");
  } catch (e) {
    console.error("Google callback error:", e);
    return redirectBack("error", "callback_exception");
  }
});
