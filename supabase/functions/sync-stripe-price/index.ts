import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    if (!userData.user) throw new Error("Not authenticated");

    // Use service role client to check roles (bypasses RLS)
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) throw new Error("Admin only");

    const { service_option_id, name, price_cents } = await req.json();
    if (!service_option_id || !name || price_cents === undefined)
      throw new Error("Missing fields");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Fetch current service option (reuse adminClient from above)

    const { data: svc } = await adminClient
      .from("service_options")
      .select("stripe_price_id")
      .eq("id", service_option_id)
      .single();

    let stripePriceId = svc?.stripe_price_id;

    if (price_cents > 0) {
      // Create a new Stripe product + price (prices are immutable so always create new)
      const product = await stripe.products.create({ name });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: price_cents,
        currency: "gbp",
      });
      stripePriceId = price.id;

      // Archive old price if exists
      if (svc?.stripe_price_id) {
        try {
          await stripe.prices.update(svc.stripe_price_id, { active: false });
        } catch (_) { /* ignore */ }
      }
    } else {
      stripePriceId = null;
    }

    // Update the service option
    await adminClient
      .from("service_options")
      .update({ price_cents, stripe_price_id: stripePriceId })
      .eq("id", service_option_id);

    return new Response(JSON.stringify({ stripe_price_id: stripePriceId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("sync-stripe-price error:", error);
    const knownSafe = [
      "Not authenticated", "Admin only", "Missing fields",
    ];
    const msg = error instanceof Error && knownSafe.includes(error.message)
      ? error.message
      : "An error occurred. Please try again.";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
