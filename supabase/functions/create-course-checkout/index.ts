import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { course_id } = await req.json();
    if (!course_id) throw new Error("Missing course_id");

    // Use service role to read course (admin-only table for inactive courses)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: course, error: courseErr } = await serviceClient
      .from("courses")
      .select("*")
      .eq("id", course_id)
      .single();

    if (courseErr || !course) throw new Error("Course not found");
    if (!course.stripe_price_id) throw new Error("This course has no price configured in Stripe");

    // Check if already purchased
    const { data: existing } = await serviceClient
      .from("course_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course_id)
      .maybeSingle();

    if (existing) throw new Error("You already own this course");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: course.stripe_price_id, quantity: 1 }],
      mode: "payment",
      metadata: {
        user_id: user.id,
        course_id: course_id,
        course_title: course.title,
        type: "course_purchase",
      },
      success_url: `${req.headers.get("origin")}/courses/${course.slug}?purchased=true`,
      cancel_url: `${req.headers.get("origin")}/courses/${course.slug}`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("course checkout error:", error);
    const knownSafe = [
      "Missing course_id", "User not authenticated",
      "Course not found", "This course has no price configured in Stripe",
      "You already own this course",
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
