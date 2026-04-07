import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

type Msg = { role: "user" | "assistant"; content: string };

const ASSISTANT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant`;
const STORAGE_KEY = "binyan_assistant_dismissed";


const ProactiveAssistant = () => {
  const { session, user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch config
  const { data: config } = useQuery({
    queryKey: ["assistant-config"],
    queryFn: async () => {
      const { data } = await supabase
        .from("assistant_config")
        .select("*")
        .limit(1)
        .maybeSingle();
      return data;
    },
    staleTime: 60000,
  });

  const isEnabled = config?.is_enabled !== false;
  const delay = (config?.auto_popup_delay_seconds ?? 5) * 1000;
  const greeting = user
    ? (config?.user_greeting || "Welcome back! 👋 How can I help you today?")
    : (config?.visitor_greeting || "Hi there! 👋 I can help you find the right support.");

  // Auto-popup after delay
  useEffect(() => {
    if (!isEnabled) return;
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const timer = setTimeout(() => {
      setShowBubble(true);
      // Auto-open after another 3 seconds
      const openTimer = setTimeout(() => {
        setOpen(true);
        setShowBubble(false);
      }, 3000);
      return () => clearTimeout(openTimer);
    }, delay);

    return () => clearTimeout(timer);
  }, [isEnabled, delay]);

  // Send greeting when first opened
  useEffect(() => {
    if (open && !hasGreeted && messages.length === 0) {
      setHasGreeted(true);
      setMessages([{ role: "assistant", content: greeting }]);
      // Create conversation record
      createConversation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasGreeted, messages.length, greeting]);

  const createConversation = async () => {
    try {
      const payload: any = {
        messages: [{ role: "assistant", content: greeting }],
        source_page: location.pathname,
        status: "active",
      };
      if (user) payload.user_id = user.id;

      const { data } = await supabase
        .from("assistant_conversations")
        .insert(payload)
        .select("id")
        .single();

      if (data) setConversationId(data.id);
    } catch { /* non-critical */ }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + "px";
    }
  }, [input]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    setInput("");
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      // Strip collected_data tags from display
      const displayContent = assistantSoFar.replace(/<collected_data>[\s\S]*?<\/collected_data>/g, "").trim();
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: displayContent } : m));
        }
        return [...prev, { role: "assistant", content: displayContent }];
      });
    };

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      } else {
        headers.apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      }

      const resp = await fetch(ASSISTANT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: newMessages,
          conversation_id: conversationId,
          source_page: location.pathname,
          context_type: user ? "user" : "visitor",
        }),
      });

      if (!resp.ok || !resp.body) {
        upsertAssistant(resp.status === 429 ? "I'm a bit busy right now. Please try again shortly." : "Sorry, something went wrong.");
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ") || line.startsWith(":") || !line.trim()) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsertAssistant(c);
          } catch { }
        }
      }

      // Extract and save collected data
      const collectedMatch = assistantSoFar.match(/<collected_data>([\s\S]*?)<\/collected_data>/);
      if (collectedMatch) {
        try {
          const data = JSON.parse(collectedMatch[1]);
          if (conversationId) {
            for (const [key, value] of Object.entries(data)) {
              if (value && typeof value === "string" && value !== "...") {
                await supabase.from("assistant_collected_data").insert({
                  conversation_id: conversationId,
                  user_id: user?.id || null,
                  field_name: key,
                  field_value: value,
                  source: "conversation",
                });
              }
            }
          }
        } catch { /* parse error */ }
      }

      // Update conversation messages
      if (conversationId) {
        const finalMessages = [...newMessages];
        if (assistantSoFar) {
          finalMessages.push({ role: "assistant", content: assistantSoFar.replace(/<collected_data>[\s\S]*?<\/collected_data>/g, "").trim() });
        }
        await supabase
          .from("assistant_conversations")
          .update({ messages: finalMessages, updated_at: new Date().toISOString() })
          .eq("id", conversationId);
      }
    } catch {
      upsertAssistant("Connection error. Please try again.");
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setShowBubble(false);
    sessionStorage.setItem(STORAGE_KEY, "true");
  };

  if (!isEnabled) return null;

  return (
    <>
      {/* Bubble preview */}
      <AnimatePresence>
        {showBubble && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 right-6 z-50 max-w-[280px]"
          >
            <div
              className="bg-card border border-border rounded-2xl p-4 shadow-lg cursor-pointer"
              onClick={() => { setOpen(true); setShowBubble(false); }}
            >
              <p className="text-sm text-foreground">{greeting}</p>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-r border-b border-border rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => { setOpen(true); setShowBubble(false); }}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
          >
            <div className="relative">
              <Bot size={28} />
              <Sparkles size={12} className="absolute -top-1 -right-1 text-accent" />
            </div>
            {showBubble && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Binyan Assistant</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Online — here to help
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full h-8 w-8">
                <X size={16} />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot size={14} className="text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                    }`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-2 [&>p:last-child]:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl p-3 text-sm text-muted-foreground">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="rounded-xl text-sm min-h-[36px] max-h-[100px] resize-none py-2"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={isLoading}
              />
              <Button
                size="icon"
                className="rounded-full shrink-0 h-9 w-9"
                onClick={send}
                disabled={isLoading || !input.trim()}
              >
                <Send size={14} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProactiveAssistant;
