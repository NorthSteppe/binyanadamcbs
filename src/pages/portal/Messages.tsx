import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare, Send, Search, ArrowLeft, Users, Circle, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const portalT = (t as any).portal || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.rpc("get_safe_profiles");
    if (data) {
      setAllUsers(
        (data as any[])
          .filter((u: any) => u.id !== user.id && u.full_name)
          .map((u: any) => ({ id: u.id, full_name: u.full_name, avatar_url: u.avatar_url }))
      );
    }
  }, [user]);

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
        if (otherId === user.id) return;
        if (!convMap.has(otherId)) convMap.set(otherId, { messages: [], unread: 0 });
        const conv = convMap.get(otherId)!;
        conv.messages.push(msg);
        if (!msg.read && msg.recipient_id === user.id) conv.unread++;
      });
      const convArr: Conversation[] = [];
      convMap.forEach((val, odId) => {
        const profile = allUsers.find((u) => u.id === odId);
        if (profile && val.messages.length > 0) {
          convArr.push({ user: profile, lastMessage: val.messages[val.messages.length - 1], unreadCount: val.unread });
        }
      });
      convArr.sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());
      setConversations(convArr);
    },
    [user, allUsers]
  );

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { if (allUsers.length > 0) fetchMessages(); }, [allUsers, fetchMessages]);

  // Auto-select conversation from ?user= query param (e.g. from notification link)
  const pendingUserRef = useRef<string | null>(null);
  
  useEffect(() => {
    const targetUserId = searchParams.get("user");
    if (targetUserId) {
      pendingUserRef.current = targetUserId;
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!pendingUserRef.current || !allUsers.length || conversations === undefined) return;
    const targetProfile = allUsers.find((u) => u.id === pendingUserRef.current);
    if (targetProfile) {
      selectConversation(targetProfile);
      pendingUserRef.current = null;
    }
  }, [allUsers, conversations]);

  // Realtime messages
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const msg = payload.new as Message;
          if (msg.sender_id === user.id || msg.recipient_id === user.id) {
            setMessages((prev) => {
              const updated = [...prev, msg];
              buildConversations(updated);
              return updated;
            });
            if (msg.recipient_id === user.id && selectedUser?.id === msg.sender_id) {
              supabase.from("messages").update({ read: true }).eq("id", msg.id).then();
            }
          }
        } else if (payload.eventType === "UPDATE") {
          const updated = payload.new as Message;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, selectedUser, buildConversations]);

  // Realtime typing indicator
  useEffect(() => {
    if (!user || !selectedUser) { setOtherTyping(false); return; }
    const channel = supabase
      .channel(`typing-${selectedUser.id}-${user.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "typing_status",
        filter: `user_id=eq.${selectedUser.id}`,
      }, (payload) => {
        const row = payload.new as any;
        if (row?.conversation_with === user.id) setOtherTyping(!!row.is_typing);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser, otherTyping]);

  // Send typing status
  const sendTypingStatus = useCallback(async (typing: boolean) => {
    if (!user || !selectedUser) return;
    await supabase.from("typing_status" as any).upsert({
      user_id: user.id,
      conversation_with: selectedUser.id,
      is_typing: typing,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,conversation_with" });
  }, [user, selectedUser]);

  const handleTyping = useCallback(() => {
    sendTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTypingStatus(false), 2500);
  }, [sendTypingStatus]);

  const selectConversation = async (profile: UserProfile) => {
    setSelectedUser(profile);
    setShowNewChat(false);
    setOtherTyping(false);
    if (!user) return;
    await supabase.from("messages").update({ read: true }).eq("sender_id", profile.id).eq("recipient_id", user.id).eq("read", false);
    setMessages((prev) => prev.map((m) => (m.sender_id === profile.id && m.recipient_id === user.id ? { ...m, read: true } : m)));
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !user || !selectedUser) return;
    setSending(true);
    sendTypingStatus(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    await supabase.from("messages").insert({ sender_id: user.id, recipient_id: selectedUser.id, content: newMsg.trim() });
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
    (u) => u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) && !conversations.some((c) => c.user.id === u.id)
  );

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const showSidebar = !selectedUser || !isMobile;
  const showChat = selectedUser || !isMobile;

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden pt-16">
        {/* Sidebar */}
        {showSidebar && (
          <div className={`${isMobile ? "w-full" : "w-80 border-r border-border"} flex flex-col bg-card`}>
            <div className="p-3 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                <MessageSquare size={18} className="text-primary" />
                {portalT.messagesTitle || "Messages"}
              </h2>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowNewChat(!!e.target.value); }}
                    placeholder="Search or start new chat..."
                    className="pl-9 rounded-full text-sm h-9"
                  />
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 rounded-full"
                  onClick={() => { setShowNewChat(!showNewChat); setSearchQuery(""); }}>
                  <Users size={16} />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {showNewChat && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-4 pt-3 pb-1 font-medium">Start a conversation</p>
                  {filteredUsers.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No users found</p>}
                  {filteredUsers.map((u) => (
                    <button key={u.id} onClick={() => selectConversation(u)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={u.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(u.full_name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground truncate">{u.full_name}</span>
                    </button>
                  ))}
                </div>
              )}

              {!showNewChat && conversations.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto text-muted-foreground/30 mb-3" size={32} />
                  <p className="text-xs text-muted-foreground">No conversations yet</p>
                  <Button variant="link" size="sm" className="text-xs mt-1" onClick={() => setShowNewChat(true)}>Start a new chat</Button>
                </div>
              )}

              {!showNewChat && conversations.map((conv) => (
                <button key={conv.user.id} onClick={() => selectConversation(conv.user)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${selectedUser?.id === conv.user.id ? "bg-muted/70" : ""}`}>
                  <div className="relative shrink-0">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={conv.user.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(conv.user.full_name)}</AvatarFallback>
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
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{formatTime(conv.lastMessage.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {conv.lastMessage.sender_id === user?.id && (
                        conv.lastMessage.read
                          ? <CheckCheck size={12} className="text-primary shrink-0" />
                          : <Check size={12} className="text-muted-foreground shrink-0" />
                      )}
                      <p className={`text-xs truncate ${conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {conv.lastMessage.sender_id === user?.id ? "" : ""}{conv.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat area */}
        {showChat && (
          <div className="flex-1 flex flex-col bg-background">
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
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
                  {isMobile && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0"
                      onClick={() => { setSelectedUser(null); sendTypingStatus(false); }}>
                      <ArrowLeft size={16} />
                    </Button>
                  )}
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={selectedUser.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(selectedUser.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{selectedUser.full_name}</p>
                    {otherTyping ? (
                      <p className="text-[11px] text-primary font-medium animate-pulse">typing...</p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Circle size={6} className="fill-green-500 text-green-500" /> Online
                      </p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                  {chatMessages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-10">No messages yet. Say hello!</p>
                  )}
                  {chatMessages.map((msg) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                          isMine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-0.5 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            <span className="text-[10px]">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {isMine && (
                              msg.read
                                ? <CheckCheck size={14} className="text-primary-foreground/80" />
                                : <Check size={14} className="text-primary-foreground/50" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator bubble */}
                  {otherTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="border-t border-border bg-card px-4 py-3 flex gap-2 shrink-0"
                  style={{ paddingBottom: isMobile ? "calc(env(safe-area-inset-bottom, 0px) + 12px)" : undefined }}>
                  <Input
                    value={newMsg}
                    onChange={(e) => { setNewMsg(e.target.value); handleTyping(); }}
                    placeholder={portalT.typeMessage || "Type a message..."}
                    className="rounded-full"
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  />
                  <Button size="icon" className="rounded-full shrink-0" onClick={handleSend} disabled={sending || !newMsg.trim()}>
                    <Send size={18} />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
