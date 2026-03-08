import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { tasks, sessions, focus_blocks, date } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an AI scheduling assistant. Given a user's tasks, existing sessions, and focus blocks for the day, create an optimal daily schedule.

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

    const userPrompt = `Schedule these items for today:

TASKS (unscheduled):
${JSON.stringify(tasks, null, 2)}

EXISTING SESSIONS (fixed, cannot move):
${JSON.stringify(sessions, null, 2)}

EXISTING FOCUS BLOCKS (fixed, cannot move):
${JSON.stringify(focus_blocks, null, 2)}

Create an optimal schedule fitting tasks around the fixed commitments.`;

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
        tools: [
          {
            type: "function",
            function: {
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
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_schedule" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let schedule = { plan: [], scheduled_tasks: [] };
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
