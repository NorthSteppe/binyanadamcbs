import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

const Messages = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const portalT = (t as any).portal || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!user) return;
    const { data } = await supabase.from("messages").select("*")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
    await supabase.from("messages").update({ read: true }).eq("recipient_id", user.id).eq("read", false);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase.channel("messages-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === user?.id || msg.recipient_id === user?.id) {
          setMessages((prev) => [...prev, msg]);
          if (msg.recipient_id === user?.id) {
            supabase.from("messages").update({ read: true }).eq("id", msg.id);
          }
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !user) return;
    setSending(true);
    await supabase.from("messages").insert({ sender_id: user.id, recipient_id: user.id, content: newMsg.trim() });
    setNewMsg("");
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <section className="pt-28 pb-8 flex-1 flex flex-col">
        <div className="container flex-1 flex flex-col">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl mb-2 flex items-center gap-3">
              <MessageSquare className="text-primary" size={28} />
              {portalT.messagesTitle || "Messages"}
            </h1>
            <p className="text-muted-foreground mb-4">{portalT.messagesSubtitle || "Communicate securely with your practitioner."}</p>

            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <a href="tel:+447715460054" className="flex items-center gap-2 px-4 py-2 bg-card border border-border/50 rounded-full text-foreground hover:border-primary/30 transition-colors">
                <Phone size={14} className="text-primary" /> +44 7715 460054
              </a>
              <a href="mailto:adamdayan@bacbs.com" className="flex items-center gap-2 px-4 py-2 bg-card border border-border/50 rounded-full text-foreground hover:border-primary/30 transition-colors">
                <Mail size={14} className="text-primary" /> adamdayan@bacbs.com
              </a>
            </div>
          </motion.div>

          <div className="bg-card rounded-2xl border border-border/50 flex-1 flex flex-col overflow-hidden" style={{ minHeight: 400 }}>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-10">{portalT.noMessages || "No messages yet. Start a conversation."}</p>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`max-w-[75%] rounded-2xl p-4 text-sm ${msg.sender_id === user?.id ? "ms-auto bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {msg.content}
                  <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-border p-4 flex gap-3">
              <Input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder={portalT.typeMessage || "Type a message..."} className="rounded-full" onKeyDown={(e) => e.key === "Enter" && handleSend()} />
              <Button size="icon" className="rounded-full shrink-0" onClick={handleSend} disabled={sending || !newMsg.trim()}>
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

export default Messages;
