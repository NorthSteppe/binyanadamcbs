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
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { tasks, projects, sessions, client_todos, date } = body;

    const bodyStr = JSON.stringify(body);
    if (bodyStr.length > 50000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (Array.isArray(tasks) && tasks.length > 200) {
      return new Response(JSON.stringify({ error: "Too many tasks (max 200)" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (Array.isArray(projects) && projects.length > 50) {
      return new Response(JSON.stringify({ error: "Too many projects (max 50)" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a productivity coach AI for a therapy/clinical practice. Based on the user's existing tasks, upcoming sessions, assigned client todos, and projects, suggest 3-5 new actionable tasks they should focus on.

Rules:
- Analyze existing tasks, upcoming sessions, and client todos to suggest relevant follow-ups
- Prioritize by deadlines — overdue and soon-due tasks should influence suggestions
- If the user has upcoming sessions, suggest preparation tasks (e.g. "Review notes for session with X")
- If there are incomplete client todos, suggest follow-up or review tasks
- Consider project context — suggest tasks that advance active projects
- Be specific and actionable (not vague like "work on project")
- Assign realistic time estimates (15-120 minutes)
- Set priorities based on deadline urgency and session timing
- If tasks are overdue, suggest catching up on those first
- Today's date is ${date}`;

    const sessionsBlock = Array.isArray(sessions) && sessions.length > 0
      ? `\n\nUPCOMING SESSIONS:\n${JSON.stringify(sessions, null, 2)}`
      : "\n\nUPCOMING SESSIONS: None scheduled";

    const todosBlock = Array.isArray(client_todos) && client_todos.length > 0
      ? `\n\nASSIGNED CLIENT TODOS:\n${JSON.stringify(client_todos, null, 2)}`
      : "";

    const userPrompt = `Here is the user's current context:

EXISTING TASKS:
${JSON.stringify(tasks || [], null, 2)}

PROJECTS:
${JSON.stringify(projects || [], null, 2)}${sessionsBlock}${todosBlock}

Based on all of this context, suggest 3-5 new tasks the user should add to their calendar today. Consider what's overdue, upcoming sessions that need preparation, client todos that need follow-up, and what projects need attention.`;

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
              name: "suggest_tasks",
              description: "Return 3-5 actionable task suggestions based on user context including sessions and todos",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Clear, actionable task title" },
                        description: { type: "string", description: "Brief description of why this task matters" },
                        priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                        estimated_minutes: { type: "number", description: "Estimated time in minutes" },
                        suggested_time: { type: "string", description: "Suggested time slot in HH:MM format" },
                        reason: { type: "string", description: "Why this is being suggested (deadline, session prep, client follow-up, etc.)" },
                      },
                      required: ["title", "description", "priority", "estimated_minutes", "suggested_time", "reason"],
                    },
                  },
                },
                required: ["suggestions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_tasks" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let suggestions = { suggestions: [] };
    if (toolCall?.function?.arguments) {
      suggestions = JSON.parse(toolCall.function.arguments);
    }

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Suggest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
