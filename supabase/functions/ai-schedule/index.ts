import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { mode } = body;

    // Reject oversized payloads
    const bodyStr = JSON.stringify(body);
    if (bodyStr.length > 50000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Enforce role check for team mode
    if (mode === "team") {
      const svcClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: roleRow } = await svcClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .in("role", ["admin", "team_member"])
        .limit(1)
        .maybeSingle();
      if (!roleRow) {
        return new Response(JSON.stringify({ error: "Forbidden: team scheduling requires staff role" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt: string;
    let userPrompt: string;

    if (mode === "team") {
      // Team calendar auto-scheduler
      const { unscheduled_sessions, existing_sessions, date, clients } = body;

      // Array length limits
      if (Array.isArray(unscheduled_sessions) && unscheduled_sessions.length > 50) {
        return new Response(JSON.stringify({ error: "Too many unscheduled sessions (max 50)" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (Array.isArray(existing_sessions) && existing_sessions.length > 50) {
        return new Response(JSON.stringify({ error: "Too many existing sessions (max 50)" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (Array.isArray(clients) && clients.length > 100) {
        return new Response(JSON.stringify({ error: "Too many clients (max 100)" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      systemPrompt = `You are an AI scheduling assistant for a clinical practice. Given unscheduled client sessions and existing booked sessions for the day, optimally slot the unscheduled sessions into available time gaps.

Rules:
- Work hours are 8:00-18:00
- Never overlap with existing sessions
- Leave at least 15 minutes between sessions for notes and transition
- Include a lunch break around 12:30-13:15
- Spread sessions evenly throughout the day
- Prioritize earlier slots for earlier requests
- Return suggested times for each unscheduled session

Return a JSON object with:
- "scheduled": array of { session_id: string, suggested_time: "HH:MM", title: string, client_name: string, duration_minutes: number }
- "summary": a brief sentence describing the schedule

Today's date is ${date}.`;

      userPrompt = `Schedule these sessions for today:

UNSCHEDULED SESSIONS (need times):
${JSON.stringify(unscheduled_sessions, null, 2)}

EXISTING SESSIONS (fixed, cannot move):
${JSON.stringify(existing_sessions, null, 2)}

CLIENT INFO:
${JSON.stringify(clients, null, 2)}

Find optimal time slots for the unscheduled sessions around the fixed ones.`;
    } else {
      // Personal task scheduler (existing behavior)
      const { tasks, sessions, focus_blocks, date } = body;

      systemPrompt = `You are an AI scheduling assistant. Given a user's tasks, existing sessions, and focus blocks for the day, create an optimal daily schedule.

Rules:
- Work hours are typically 8:00-18:00 unless existing sessions suggest otherwise
- Never overlap with existing sessions or focus blocks
- Prioritize tasks by: urgent > high > medium > low
- Tasks with earlier due dates get priority
- Include short breaks between intense tasks
- Group similar tasks when possible
- Include a lunch break around 12:00-13:00

Return a JSON object with two keys:
1. "plan": array of { time: "HH:MM", title: string, type: "task"|"focus"|"session"|"break", duration_minutes: number, task_id?: string }
2. "scheduled_tasks": array of { task_id: string, scheduled_start: ISO timestamp, scheduled_end: ISO timestamp }

Today's date is ${date}. Use ISO timestamps for scheduled_tasks based on this date.`;

      userPrompt = `Schedule these items for today:

TASKS (unscheduled):
${JSON.stringify(tasks, null, 2)}

EXISTING SESSIONS (fixed, cannot move):
${JSON.stringify(sessions, null, 2)}

EXISTING FOCUS BLOCKS (fixed, cannot move):
${JSON.stringify(focus_blocks, null, 2)}

Create an optimal schedule fitting tasks around the fixed commitments.`;
    }

    const toolDef = mode === "team" ? {
      name: "create_team_schedule",
      description: "Create an optimized team schedule for the day",
      parameters: {
        type: "object",
        properties: {
          scheduled: {
            type: "array",
            items: {
              type: "object",
              properties: {
                session_id: { type: "string" },
                suggested_time: { type: "string", description: "HH:MM format" },
                title: { type: "string" },
                client_name: { type: "string" },
                duration_minutes: { type: "number" },
              },
              required: ["session_id", "suggested_time", "title", "duration_minutes"],
            },
          },
          summary: { type: "string" },
        },
        required: ["scheduled", "summary"],
      },
    } : {
      name: "create_schedule",
      description: "Create an optimized daily schedule",
      parameters: {
        type: "object",
        properties: {
          plan: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time: { type: "string", description: "HH:MM format" },
                title: { type: "string" },
                type: { type: "string", enum: ["task", "focus", "session", "break"] },
                duration_minutes: { type: "number" },
                task_id: { type: "string" },
              },
              required: ["time", "title", "type", "duration_minutes"],
            },
          },
          scheduled_tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task_id: { type: "string" },
                scheduled_start: { type: "string" },
                scheduled_end: { type: "string" },
              },
              required: ["task_id", "scheduled_start", "scheduled_end"],
            },
          },
        },
        required: ["plan", "scheduled_tasks"],
      },
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{ type: "function", function: toolDef }],
        tool_choice: { type: "function", function: { name: toolDef.name } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI scheduling error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let schedule: any = mode === "team" ? { scheduled: [], summary: "" } : { plan: [], scheduled_tasks: [] };
    if (toolCall?.function?.arguments) {
      schedule = JSON.parse(toolCall.function.arguments);
    }

    return new Response(JSON.stringify(schedule), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Schedule error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
