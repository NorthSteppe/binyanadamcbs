import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Verify webhook secret — fail closed if not configured
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    if (!webhookSecret || req.headers.get("x-webhook-secret") !== webhookSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    
    // Expected payload from n8n:
    // {
    //   session_id?: string,          // Direct session ID if known
    //   session_date?: string,        // ISO date to match session by date
    //   client_name?: string,         // Client name to help match session
    //   notes: string,                // The Plaud.ai summary text
    //   plaud_recording_id?: string,  // Optional Plaud recording ID
    //   append?: boolean              // Whether to append to existing notes (default: true)
    // }

    const { session_id, session_date, client_name, notes, plaud_recording_id, append = true } = body;

    if (!notes) {
      return new Response(JSON.stringify({ error: "Missing 'notes' field" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let targetSessionId = session_id;

    // If no direct session_id, try to find by date and/or client name
    if (!targetSessionId && session_date) {
      let query = supabase
        .from("sessions")
        .select("id, title, client_id, session_date, notes")
        .gte("session_date", `${session_date}T00:00:00`)
        .lte("session_date", `${session_date}T23:59:59`)
        .order("session_date", { ascending: true });

      const { data: sessions, error: searchError } = await query;

      if (searchError) {
        console.error("Search error:", searchError);
        return new Response(JSON.stringify({ error: "Failed to search sessions" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!sessions || sessions.length === 0) {
        return new Response(JSON.stringify({ 
          error: "No sessions found for the given date",
          session_date 
        }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // If client_name provided, try to match via profiles
      if (client_name && sessions.length > 1) {
        const clientIds = sessions.map(s => s.client_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", clientIds);
        
        const matchedProfile = profiles?.find(p => 
          p.full_name.toLowerCase().includes(client_name.toLowerCase())
        );
        
        if (matchedProfile) {
          const matchedSession = sessions.find(s => s.client_id === matchedProfile.id);
          if (matchedSession) targetSessionId = matchedSession.id;
        }
      }

      // Default to first session of the day if no better match
      if (!targetSessionId) {
        targetSessionId = sessions[0].id;
      }
    }

    if (!targetSessionId) {
      return new Response(JSON.stringify({ error: "Could not determine target session. Provide session_id or session_date." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current session notes if appending
    let finalNotes = notes;
    if (append) {
      const { data: currentSession } = await supabase
        .from("sessions")
        .select("notes")
        .eq("id", targetSessionId)
        .single();

      if (currentSession?.notes) {
        const timestamp = new Date().toLocaleString("en-GB", { 
          dateStyle: "short", timeStyle: "short" 
        });
        finalNotes = `${currentSession.notes}\n\n--- Plaud.ai Summary (${timestamp}) ---\n${notes}`;
      } else {
        const timestamp = new Date().toLocaleString("en-GB", { 
          dateStyle: "short", timeStyle: "short" 
        });
        finalNotes = `--- Plaud.ai Summary (${timestamp}) ---\n${notes}`;
      }
    }

    const updateData: Record<string, unknown> = { notes: finalNotes };
    if (plaud_recording_id) {
      updateData.plaud_recording_id = plaud_recording_id;
    }

    const { error: updateError } = await supabase
      .from("sessions")
      .update(updateData)
      .eq("id", targetSessionId);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update session notes" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      session_id: targetSessionId,
      message: "Notes attached to session successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
