import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const Chat = () => {
  const { t } = useLanguage();
  const { session } = useAuth();
  const portalT = (t as any).portal || {};
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || isLoading || !session?.access_token) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          upsertAssistant("I'm receiving too many requests right now. Please try again in a moment.");
        } else if (resp.status === 402) {
          upsertAssistant("The AI service needs additional credits. Please contact the administrator.");
        } else {
          upsertAssistant("Sorry, something went wrong. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch {
      upsertAssistant("Connection error. Please check your internet and try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <section className="pt-28 pb-8 flex-1 flex flex-col">
        <div className="container flex-1 flex flex-col max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl mb-2 flex items-center gap-3">
              <Bot className="text-primary" size={28} />
              {portalT.aiAssistant || "AI Assistant"}
            </h1>
            <p className="text-muted-foreground mb-6">{portalT.aiSubtitle || "Ask questions about our services, behavioural approaches, or general guidance."}</p>
          </motion.div>

          <div className="bg-card rounded-2xl border border-border/50 flex-1 flex flex-col overflow-hidden" style={{ minHeight: 400 }}>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-16">
                  <Bot className="mx-auto text-muted-foreground/40 mb-3" size={48} />
                  <p className="text-muted-foreground text-sm">{portalT.aiWelcome || "Hi! I'm Binyan's AI assistant. How can I help you today?"}</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`max-w-[75%] rounded-2xl p-4 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Bot size={14} className="text-muted-foreground" /></div>
                  <div className="bg-muted rounded-2xl p-4 text-sm text-muted-foreground animate-pulse">Thinking...</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-border p-4 flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={portalT.askAnything || "Ask anything..."}
                className="rounded-full"
                onKeyDown={(e) => e.key === "Enter" && send()}
                disabled={isLoading}
              />
              <Button size="icon" className="rounded-full shrink-0" onClick={send} disabled={isLoading || !input.trim()}>
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Chat;
