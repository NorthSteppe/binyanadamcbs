import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Bot, BookOpen, GitBranch, MessageSquare, Plus, Trash2, Save, Eye } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

const AssistantManager = () => {
  const queryClient = useQueryClient();

  // Config
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["admin-assistant-config"],
    queryFn: async () => {
      const { data } = await supabase.from("assistant_config").select("*").limit(1).maybeSingle();
      return data;
    },
  });

  const [configForm, setConfigForm] = useState<any>(null);
  const activeConfig = configForm || config;

  const updateConfig = useMutation({
    mutationFn: async (values: any) => {
      if (!config?.id) return;
      const { error } = await supabase.from("assistant_config").update(values).eq("id", config.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-assistant-config"] }); toast.success("Config saved"); setConfigForm(null); },
    onError: () => toast.error("Failed to save config"),
  });

  // Knowledge
  const { data: knowledge = [] } = useQuery({
    queryKey: ["admin-assistant-knowledge"],
    queryFn: async () => {
      const { data } = await supabase.from("assistant_knowledge").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const [newKnowledge, setNewKnowledge] = useState({ title: "", content: "", category: "general" });

  const addKnowledge = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("assistant_knowledge").insert({
        ...newKnowledge,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-assistant-knowledge"] }); setNewKnowledge({ title: "", content: "", category: "general" }); toast.success("Knowledge added"); },
    onError: () => toast.error("Failed to add knowledge"),
  });

  const deleteKnowledge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("assistant_knowledge").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-assistant-knowledge"] }); toast.success("Deleted"); },
  });

  // Flows
  const { data: flows = [] } = useQuery({
    queryKey: ["admin-assistant-flows"],
    queryFn: async () => {
      const { data } = await supabase.from("assistant_flows").select("*").order("display_order");
      return data || [];
    },
  });

  const [newFlow, setNewFlow] = useState({ name: "", description: "", trigger_type: "visitor", flow_steps: "[]" });

  const addFlow = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("assistant_flows").insert({
        name: newFlow.name,
        description: newFlow.description,
        trigger_type: newFlow.trigger_type,
        flow_steps: JSON.parse(newFlow.flow_steps),
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-assistant-flows"] }); setNewFlow({ name: "", description: "", trigger_type: "visitor", flow_steps: "[]" }); toast.success("Flow added"); },
    onError: (e) => toast.error("Failed: " + (e as Error).message),
  });

  const deleteFlow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("assistant_flows").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-assistant-flows"] }); toast.success("Deleted"); },
  });

  // Conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["admin-assistant-conversations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("assistant_conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  // Collected data
  const { data: collectedData = [] } = useQuery({
    queryKey: ["admin-assistant-collected-data"],
    queryFn: async () => {
      const { data } = await supabase
        .from("assistant_collected_data")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  if (configLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <section className="pt-28 pb-12 flex-1">
        <div className="container max-w-5xl">
          <div className="flex items-center gap-3 mb-6">
            <Bot className="text-primary" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Assistant Manager</h1>
              <p className="text-sm text-muted-foreground">Configure the proactive AI assistant</p>
            </div>
          </div>

          <Tabs defaultValue="config">
            <TabsList className="mb-6">
              <TabsTrigger value="config" className="gap-2"><Bot size={14} /> Config</TabsTrigger>
              <TabsTrigger value="knowledge" className="gap-2"><BookOpen size={14} /> Knowledge</TabsTrigger>
              <TabsTrigger value="flows" className="gap-2"><GitBranch size={14} /> Flows</TabsTrigger>
              <TabsTrigger value="conversations" className="gap-2"><MessageSquare size={14} /> Conversations</TabsTrigger>
              <TabsTrigger value="data" className="gap-2"><Eye size={14} /> Collected Data</TabsTrigger>
            </TabsList>

            {/* CONFIG TAB */}
            <TabsContent value="config">
              <Card>
                <CardHeader>
                  <CardTitle>Assistant Configuration</CardTitle>
                  <CardDescription>Control the assistant's behavior, personality, and greeting messages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={activeConfig?.is_enabled ?? true}
                      onCheckedChange={(v) => setConfigForm({ ...activeConfig, is_enabled: v })}
                    />
                    <Label>Assistant Enabled</Label>
                  </div>

                  <div>
                    <Label>Auto-popup Delay (seconds)</Label>
                    <Input
                      type="number"
                      value={activeConfig?.auto_popup_delay_seconds ?? 5}
                      onChange={(e) => setConfigForm({ ...activeConfig, auto_popup_delay_seconds: parseInt(e.target.value) || 5 })}
                      className="mt-1 max-w-[200px]"
                    />
                  </div>

                  <div>
                    <Label>System Prompt</Label>
                    <p className="text-xs text-muted-foreground mb-1">This defines the assistant's personality and instructions</p>
                    <Textarea
                      value={activeConfig?.system_prompt ?? ""}
                      onChange={(e) => setConfigForm({ ...activeConfig, system_prompt: e.target.value })}
                      className="mt-1 min-h-[200px]"
                    />
                  </div>

                  <div>
                    <Label>Visitor Greeting</Label>
                    <Textarea
                      value={activeConfig?.visitor_greeting ?? ""}
                      onChange={(e) => setConfigForm({ ...activeConfig, visitor_greeting: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>User Greeting (logged-in)</Label>
                    <Textarea
                      value={activeConfig?.user_greeting ?? ""}
                      onChange={(e) => setConfigForm({ ...activeConfig, user_greeting: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <Button onClick={() => updateConfig.mutate(configForm || activeConfig)} disabled={updateConfig.isPending}>
                    <Save size={14} className="mr-2" /> Save Configuration
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* KNOWLEDGE TAB */}
            <TabsContent value="knowledge">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add Knowledge Document</CardTitle>
                  <CardDescription>Documents the assistant can reference when answering questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Input value={newKnowledge.title} onChange={(e) => setNewKnowledge({ ...newKnowledge, title: e.target.value })} />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={newKnowledge.category} onValueChange={(v) => setNewKnowledge({ ...newKnowledge, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="faq">FAQ</SelectItem>
                          <SelectItem value="policies">Policies</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea value={newKnowledge.content} onChange={(e) => setNewKnowledge({ ...newKnowledge, content: e.target.value })} rows={6} />
                  </div>
                  <Button onClick={() => addKnowledge.mutate()} disabled={!newKnowledge.title || addKnowledge.isPending}>
                    <Plus size={14} className="mr-2" /> Add Document
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {knowledge.map((doc: any) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{doc.title}</h3>
                          <Badge variant="secondary">{doc.category}</Badge>
                          {!doc.is_active && <Badge variant="outline">Inactive</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{doc.content}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteKnowledge.mutate(doc.id)}>
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {knowledge.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No knowledge documents yet</p>}
              </div>
            </TabsContent>

            {/* FLOWS TAB */}
            <TabsContent value="flows">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create Question Flow</CardTitle>
                  <CardDescription>Define guided question sequences for the assistant to follow</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Flow Name</Label>
                      <Input value={newFlow.name} onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })} placeholder="e.g. Service Recommendation" />
                    </div>
                    <div>
                      <Label>Target Audience</Label>
                      <Select value={newFlow.trigger_type} onValueChange={(v) => setNewFlow({ ...newFlow, trigger_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visitor">Visitors Only</SelectItem>
                          <SelectItem value="user">Users Only</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input value={newFlow.description} onChange={(e) => setNewFlow({ ...newFlow, description: e.target.value })} placeholder="What does this flow help with?" />
                  </div>
                  <div>
                    <Label>Flow Steps (JSON)</Label>
                    <p className="text-xs text-muted-foreground mb-1">Each step: {`{"question": "...", "options": ["A", "B", "C"], "data_field": "field_name"}`}</p>
                    <Textarea
                      value={newFlow.flow_steps}
                      onChange={(e) => setNewFlow({ ...newFlow, flow_steps: e.target.value })}
                      rows={6}
                      className="font-mono text-xs"
                    />
                  </div>
                  <Button onClick={() => addFlow.mutate()} disabled={!newFlow.name || addFlow.isPending}>
                    <Plus size={14} className="mr-2" /> Add Flow
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {flows.map((flow: any) => (
                  <Card key={flow.id}>
                    <CardContent className="p-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{flow.name}</h3>
                          <Badge variant="secondary">{flow.trigger_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{flow.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{Array.isArray(flow.flow_steps) ? flow.flow_steps.length : 0} steps</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteFlow.mutate(flow.id)}>
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {flows.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No flows yet</p>}
              </div>
            </TabsContent>

            {/* CONVERSATIONS TAB */}
            <TabsContent value="conversations">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Conversations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {conversations.map((conv: any) => (
                          <div
                            key={conv.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? "bg-primary/5 border-primary" : "hover:bg-muted"}`}
                            onClick={() => setSelectedConversation(conv)}
                          >
                            <div className="flex items-center justify-between">
                              <Badge variant={conv.user_id ? "default" : "secondary"}>
                                {conv.user_id ? "User" : "Visitor"}
                              </Badge>
                              <Badge variant="outline">{conv.status}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {conv.source_page} · {format(new Date(conv.updated_at), "dd MMM HH:mm")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {Array.isArray(conv.messages) ? `${conv.messages.length} messages` : "—"}
                            </p>
                          </div>
                        ))}
                        {conversations.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conversation Detail</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedConversation ? (
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-3">
                          {Array.isArray(selectedConversation.messages) && selectedConversation.messages.map((msg: any, i: number) => (
                            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                              <div className={`max-w-[85%] rounded-xl p-3 text-xs ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-16">Select a conversation to view</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* COLLECTED DATA TAB */}
            <TabsContent value="data">
              <Card>
                <CardHeader>
                  <CardTitle>Collected Data</CardTitle>
                  <CardDescription>Information gathered from assistant conversations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left font-medium text-muted-foreground">Field</th>
                          <th className="p-3 text-left font-medium text-muted-foreground">Value</th>
                          <th className="p-3 text-left font-medium text-muted-foreground">Source</th>
                          <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {collectedData.map((d: any) => (
                          <tr key={d.id} className="border-b">
                            <td className="p-3 font-medium text-foreground">{d.field_name}</td>
                            <td className="p-3 text-foreground">{d.field_value}</td>
                            <td className="p-3"><Badge variant="outline">{d.source}</Badge></td>
                            <td className="p-3 text-muted-foreground">{format(new Date(d.created_at), "dd MMM HH:mm")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {collectedData.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No data collected yet</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AssistantManager;
