import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Search, ArrowLeft, Users, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface Conversation {
  user: UserProfile;
  lastMessage: Message;
  unreadCount: number;
}

const Messages = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const portalT = (t as any).portal || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch all users for new conversation
  const fetchUsers = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .neq("id", user.id);
    if (data) setAllUsers(data);
  }, [user]);

  // Fetch all messages for this user
  const fetchMessages = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data);
      buildConversations(data);
    }
  }, [user]);

  const buildConversations = useCallback(
    (msgs: Message[]) => {
      if (!user) return;
      const convMap = new Map<string, { messages: Message[]; unread: number }>();

      msgs.forEach((msg) => {
        const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        if (otherId === user.id) return; // skip self-messages
        if (!convMap.has(otherId)) {
          convMap.set(otherId, { messages: [], unread: 0 });
        }
        const conv = convMap.get(otherId)!;
        conv.messages.push(msg);
        if (!msg.read && msg.recipient_id === user.id) {
          conv.unread++;
        }
      });

      const convArr: Conversation[] = [];
      convMap.forEach((val, odId) => {
        const profile = allUsers.find((u) => u.id === odId);
        if (profile && val.messages.length > 0) {
          convArr.push({
            user: profile,
            lastMessage: val.messages[val.messages.length - 1],
            unreadCount: val.unread,
          });
        }
      });

      convArr.sort(
        (a, b) =>
          new Date(b.lastMessage.created_at).getTime() -
          new Date(a.lastMessage.created_at).getTime()
      );
      setConversations(convArr);
    },
    [user, allUsers]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (allUsers.length > 0) fetchMessages();
  }, [allUsers, fetchMessages]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.sender_id === user.id || msg.recipient_id === user.id) {
            setMessages((prev) => {
              const updated = [...prev, msg];
              buildConversations(updated);
              return updated;
            });
            // Auto-mark read if viewing that conversation
            if (
              msg.recipient_id === user.id &&
              selectedUser?.id === msg.sender_id
            ) {
              supabase
                .from("messages")
                .update({ read: true })
                .eq("id", msg.id)
                .then();
            }
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedUser, buildConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  // Mark messages as read when selecting a conversation
  const selectConversation = async (profile: UserProfile) => {
    setSelectedUser(profile);
    setShowNewChat(false);
    if (!user) return;
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", profile.id)
      .eq("recipient_id", user.id)
      .eq("read", false);
    // Update local state
    setMessages((prev) =>
      prev.map((m) =>
        m.sender_id === profile.id && m.recipient_id === user.id
          ? { ...m, read: true }
          : m
      )
    );
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !user || !selectedUser) return;
    setSending(true);
    await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id: selectedUser.id,
      content: newMsg.trim(),
    });
    setNewMsg("");
    setSending(false);
  };

  const chatMessages = selectedUser
    ? messages.filter(
        (m) =>
          (m.sender_id === user?.id && m.recipient_id === selectedUser.id) ||
          (m.sender_id === selectedUser.id && m.recipient_id === user?.id)
      )
    : [];

  const filteredUsers = allUsers.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !conversations.some((c) => c.user.id === u.id)
  );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
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
            <p className="text-muted-foreground mb-6">
              {portalT.messagesSubtitle || "Communicate securely with your practitioner and team."}
            </p>
          </motion.div>

          <div
            className="bg-card rounded-2xl border border-border/50 flex-1 flex overflow-hidden"
            style={{ minHeight: 500 }}
          >
            {/* Sidebar: Conversations */}
            <div
              className={`w-full md:w-80 border-r border-border flex flex-col ${
                selectedUser ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="p-4 border-b border-border flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value) setShowNewChat(true);
                      else setShowNewChat(false);
                    }}
                    placeholder="Search or start new chat..."
                    className="pl-9 rounded-full text-sm h-9"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-9 w-9 rounded-full"
                  onClick={() => {
                    setShowNewChat(!showNewChat);
                    setSearchQuery("");
                  }}
                >
                  <Users size={16} />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* New chat: show user list */}
                {showNewChat && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-4 pt-3 pb-1 font-medium">
                      Start a conversation
                    </p>
                    {filteredUsers.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-6">No users found</p>
                    )}
                    {filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => selectConversation(u)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={u.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(u.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground truncate">{u.full_name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Existing conversations */}
                {!showNewChat && conversations.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto text-muted-foreground/30 mb-3" size={32} />
                    <p className="text-xs text-muted-foreground">No conversations yet</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs mt-1"
                      onClick={() => setShowNewChat(true)}
                    >
                      Start a new chat
                    </Button>
                  </div>
                )}

                {!showNewChat &&
                  conversations.map((conv) => (
                    <button
                      key={conv.user.id}
                      onClick={() => selectConversation(conv.user)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${
                        selectedUser?.id === conv.user.id ? "bg-muted/70" : ""
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-11 w-11">
                          <AvatarImage src={conv.user.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(conv.user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        {conv.unreadCount > 0 && (
                          <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground truncate">{conv.user.full_name}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                            {formatTime(conv.lastMessage.created_at)}
                          </span>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {conv.lastMessage.sender_id === user?.id ? "You: " : ""}
                          {conv.lastMessage.content}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Chat area */}
            <div className={`flex-1 flex flex-col ${!selectedUser ? "hidden md:flex" : "flex"}`}>
              {!selectedUser ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="mx-auto text-muted-foreground/20 mb-4" size={56} />
                    <p className="text-muted-foreground text-sm">Select a conversation to start messaging</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div className="flex items-center gap-3 p-4 border-b border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden h-8 w-8 rounded-full shrink-0"
                      onClick={() => setSelectedUser(null)}
                    >
                      <ArrowLeft size={16} />
                    </Button>
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={selectedUser.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(selectedUser.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedUser.full_name}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Circle size={6} className="fill-green-500 text-green-500" /> Online
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-10">
                        No messages yet. Say hello!
                      </p>
                    )}
                    {chatMessages.map((msg) => {
                      const isMine = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                              isMine
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            }`}
                          >
                            {msg.content}
                            <p
                              className={`text-[10px] mt-1 ${
                                isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                              }`}
                            >
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {isMine && msg.read && " ✓✓"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t border-border p-4 flex gap-3">
                    <Input
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      placeholder={portalT.typeMessage || "Type a message..."}
                      className="rounded-full"
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <Button
                      size="icon"
                      className="rounded-full shrink-0"
                      onClick={handleSend}
                      disabled={sending || !newMsg.trim()}
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Messages;
