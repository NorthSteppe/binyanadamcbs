import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Edit, Trash2, FileText, Tag, Users, BarChart3, Calendar } from "lucide-react";
import { format } from "date-fns";

const BlogManager = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editingPost, setEditingPost] = useState<any>(null);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<any>(null);
  const [showAuthorDialog, setShowAuthorDialog] = useState(false);

  // Form state for posts
  const [postForm, setPostForm] = useState({
    title: "", slug: "", abstract: "", content: "", cover_image_url: "",
    author_id: "", category_id: "", status: "draft", audience: "general",
    reading_time_minutes: 5, is_featured: false, is_practical_priority: false,
    meta_title: "", meta_description: "", scheduled_at: "",
  });

  const { data: posts } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts")
        .select("*, blog_authors(name), blog_categories(name)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-blog-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_categories").select("*").order("display_order");
      return data || [];
    },
  });

  const { data: tags } = useQuery({
    queryKey: ["admin-blog-tags"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_tags").select("*").order("name");
      return data || [];
    },
  });

  const { data: authors } = useQuery({
    queryKey: ["admin-blog-authors"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_authors").select("*").order("name");
      return data || [];
    },
  });

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Post CRUD
  const savePost = useMutation({
    mutationFn: async (post: any) => {
      const payload = {
        title: post.title, slug: post.slug || generateSlug(post.title),
        abstract: post.abstract, content: post.content,
        cover_image_url: post.cover_image_url || null,
        author_id: post.author_id || null, category_id: post.category_id || null,
        status: post.status, audience: post.audience,
        reading_time_minutes: post.reading_time_minutes,
        is_featured: post.is_featured, is_practical_priority: post.is_practical_priority,
        meta_title: post.meta_title, meta_description: post.meta_description,
        scheduled_at: post.scheduled_at || null,
        published_at: post.status === "published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      if (editingPost?.id) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      setShowPostDialog(false);
      setEditingPost(null);
      toast.success("Article saved");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Article deleted");
    },
  });

  // Category CRUD
  const saveCategory = useMutation({
    mutationFn: async (cat: any) => {
      const payload = { name: cat.name, slug: cat.slug || generateSlug(cat.name), description: cat.description || "", display_order: cat.display_order || 0 };
      if (editingCategory?.id) {
        await supabase.from("blog_categories").update(payload).eq("id", editingCategory.id);
      } else {
        await supabase.from("blog_categories").insert(payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog-categories"] });
      setShowCategoryDialog(false);
      setEditingCategory(null);
      toast.success("Category saved");
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => { await supabase.from("blog_categories").delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-blog-categories"] }); toast.success("Category deleted"); },
  });

  // Tag CRUD
  const saveTag = useMutation({
    mutationFn: async (tag: any) => {
      const payload = { name: tag.name, slug: tag.slug || generateSlug(tag.name) };
      if (editingTag?.id) {
        await supabase.from("blog_tags").update(payload).eq("id", editingTag.id);
      } else {
        await supabase.from("blog_tags").insert(payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog-tags"] });
      setShowTagDialog(false);
      setEditingTag(null);
      toast.success("Tag saved");
    },
  });

  const deleteTag = useMutation({
    mutationFn: async (id: string) => { await supabase.from("blog_tags").delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-blog-tags"] }); toast.success("Tag deleted"); },
  });

  // Author CRUD
  const saveAuthor = useMutation({
    mutationFn: async (author: any) => {
      const payload = { name: author.name, slug: author.slug || generateSlug(author.name), role: author.role || "", bio: author.bio || "", avatar_url: author.avatar_url || null };
      if (editingAuthor?.id) {
        await supabase.from("blog_authors").update(payload).eq("id", editingAuthor.id);
      } else {
        await supabase.from("blog_authors").insert(payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog-authors"] });
      setShowAuthorDialog(false);
      setEditingAuthor(null);
      toast.success("Author saved");
    },
  });

  const deleteAuthor = useMutation({
    mutationFn: async (id: string) => { await supabase.from("blog_authors").delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-blog-authors"] }); toast.success("Author deleted"); },
  });

  const openEditPost = (post: any) => {
    setEditingPost(post);
    setPostForm({
      title: post.title, slug: post.slug, abstract: post.abstract, content: post.content,
      cover_image_url: post.cover_image_url || "", author_id: post.author_id || "",
      category_id: post.category_id || "", status: post.status, audience: post.audience || "general",
      reading_time_minutes: post.reading_time_minutes, is_featured: post.is_featured,
      is_practical_priority: post.is_practical_priority, meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
      scheduled_at: post.scheduled_at ? format(new Date(post.scheduled_at), "yyyy-MM-dd'T'HH:mm") : "",
    });
    setShowPostDialog(true);
  };

  const openNewPost = () => {
    setEditingPost(null);
    setPostForm({
      title: "", slug: "", abstract: "", content: "", cover_image_url: "",
      author_id: "", category_id: "", status: "draft", audience: "general",
      reading_time_minutes: 5, is_featured: false, is_practical_priority: false,
      meta_title: "", meta_description: "", scheduled_at: "",
    });
    setShowPostDialog(true);
  };

  const statusColor = (s: string) => {
    if (s === "published") return "bg-emerald-100 text-emerald-800";
    if (s === "scheduled") return "bg-blue-100 text-blue-800";
    return "bg-secondary text-secondary-foreground";
  };

  const totalViews = (posts || []).reduce((sum: number, p: any) => sum + (p.view_count || 0), 0);
  const publishedCount = (posts || []).filter((p: any) => p.status === "published").length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Blog Manager</h1>
              <p className="text-sm text-muted-foreground">Manage articles, categories, tags, and authors</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{posts?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Articles</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{publishedCount}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{totalViews}</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{categories?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </CardContent></Card>
          </div>

          <Tabs defaultValue="articles">
            <TabsList className="mb-6">
              <TabsTrigger value="articles"><FileText className="h-4 w-4 mr-1" />Articles</TabsTrigger>
              <TabsTrigger value="categories"><BarChart3 className="h-4 w-4 mr-1" />Categories</TabsTrigger>
              <TabsTrigger value="tags"><Tag className="h-4 w-4 mr-1" />Tags</TabsTrigger>
              <TabsTrigger value="authors"><Users className="h-4 w-4 mr-1" />Authors</TabsTrigger>
            </TabsList>

            {/* ARTICLES TAB */}
            <TabsContent value="articles">
              <div className="flex justify-end mb-4">
                <Button onClick={openNewPost}><Plus className="h-4 w-4 mr-1" />New Article</Button>
              </div>
              <div className="space-y-3">
                {(posts || []).map((p: any) => (
                  <Card key={p.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground truncate">{p.title}</h3>
                          <Badge className={`text-xs ${statusColor(p.status)}`}>{p.status}</Badge>
                          {p.is_featured && <Badge className="text-xs bg-amber-100 text-amber-800">Featured</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{(p as any).blog_authors?.name || "No author"}</span>
                          <span>{(p as any).blog_categories?.name || "No category"}</span>
                          <span>{p.view_count} views</span>
                          {p.scheduled_at && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Scheduled: {format(new Date(p.scheduled_at), "d MMM yyyy HH:mm")}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => openEditPost(p)}><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" onClick={() => deletePost.mutate(p.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* CATEGORIES TAB */}
            <TabsContent value="categories">
              <div className="flex justify-end mb-4">
                <Button onClick={() => { setEditingCategory(null); setShowCategoryDialog(true); }}><Plus className="h-4 w-4 mr-1" />New Category</Button>
              </div>
              <div className="space-y-3">
                {(categories || []).map((c: any) => (
                  <Card key={c.id}><CardContent className="p-4 flex items-center justify-between">
                    <div><h3 className="font-medium">{c.name}</h3><p className="text-xs text-muted-foreground">{c.slug} · Order: {c.display_order}</p></div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingCategory(c); setShowCategoryDialog(true); }}><Edit className="h-3 w-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => deleteCategory.mutate(c.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </CardContent></Card>
                ))}
              </div>
            </TabsContent>

            {/* TAGS TAB */}
            <TabsContent value="tags">
              <div className="flex justify-end mb-4">
                <Button onClick={() => { setEditingTag(null); setShowTagDialog(true); }}><Plus className="h-4 w-4 mr-1" />New Tag</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                {(tags || []).map((t: any) => (
                  <Card key={t.id}><CardContent className="p-3 flex items-center gap-2">
                    <span className="text-sm font-medium">{t.name}</span>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => { setEditingTag(t); setShowTagDialog(true); }}><Edit className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => deleteTag.mutate(t.id)}><Trash2 className="h-3 w-3" /></Button>
                  </CardContent></Card>
                ))}
              </div>
            </TabsContent>

            {/* AUTHORS TAB */}
            <TabsContent value="authors">
              <div className="flex justify-end mb-4">
                <Button onClick={() => { setEditingAuthor(null); setShowAuthorDialog(true); }}><Plus className="h-4 w-4 mr-1" />New Author</Button>
              </div>
              <div className="space-y-3">
                {(authors || []).map((a: any) => (
                  <Card key={a.id}><CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {a.avatar_url ? <img src={a.avatar_url} className="h-10 w-10 rounded-full object-cover" alt={a.name} /> : <div className="h-10 w-10 rounded-full bg-secondary" />}
                      <div><h3 className="font-medium">{a.name}</h3><p className="text-xs text-muted-foreground">{a.role}</p></div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingAuthor(a); setShowAuthorDialog(true); }}><Edit className="h-3 w-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => deleteAuthor.mutate(a.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </CardContent></Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* POST DIALOG */}
          <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingPost ? "Edit Article" : "New Article"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Title</Label><Input value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value, slug: postForm.slug || generateSlug(e.target.value) })} /></div>
                  <div><Label>Slug</Label><Input value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })} /></div>
                </div>
                <div><Label>Abstract</Label><Textarea value={postForm.abstract} onChange={(e) => setPostForm({ ...postForm, abstract: e.target.value })} rows={2} /></div>
                <div><Label>Content (Markdown)</Label><Textarea value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} rows={12} className="font-mono text-sm" /></div>
                <div><Label>Cover Image URL</Label><Input value={postForm.cover_image_url} onChange={(e) => setPostForm({ ...postForm, cover_image_url: e.target.value })} /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><Label>Author</Label>
                    <Select value={postForm.author_id || "none"} onValueChange={(v) => setPostForm({ ...postForm, author_id: v === "none" ? "" : v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {(authors || []).map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Category</Label>
                    <Select value={postForm.category_id || "none"} onValueChange={(v) => setPostForm({ ...postForm, category_id: v === "none" ? "" : v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {(categories || []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Audience</Label>
                    <Select value={postForm.audience} onValueChange={(v) => setPostForm({ ...postForm, audience: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="school">Schools</SelectItem>
                        <SelectItem value="parent">Parents</SelectItem>
                        <SelectItem value="professional">Professionals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><Label>Status</Label>
                    <Select value={postForm.status} onValueChange={(v) => setPostForm({ ...postForm, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Reading Time (min)</Label><Input type="number" value={postForm.reading_time_minutes} onChange={(e) => setPostForm({ ...postForm, reading_time_minutes: parseInt(e.target.value) || 5 })} /></div>
                  {postForm.status === "scheduled" && (
                    <div><Label>Scheduled Date & Time</Label><Input type="datetime-local" value={postForm.scheduled_at} onChange={(e) => setPostForm({ ...postForm, scheduled_at: e.target.value })} /></div>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2"><Switch checked={postForm.is_featured} onCheckedChange={(v) => setPostForm({ ...postForm, is_featured: v })} /><Label>Featured</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={postForm.is_practical_priority} onCheckedChange={(v) => setPostForm({ ...postForm, is_practical_priority: v })} /><Label>Practical Priority</Label></div>
                </div>
                <div className="border-t pt-4"><h4 className="text-sm font-medium mb-3">SEO</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div><Label>Meta Title</Label><Input value={postForm.meta_title} onChange={(e) => setPostForm({ ...postForm, meta_title: e.target.value })} /></div>
                    <div><Label>Meta Description</Label><Textarea value={postForm.meta_description} onChange={(e) => setPostForm({ ...postForm, meta_description: e.target.value })} rows={2} /></div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowPostDialog(false)}>Cancel</Button>
                  <Button onClick={() => savePost.mutate(postForm)} disabled={savePost.isPending}>
                    {savePost.isPending ? "Saving..." : "Save Article"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* CATEGORY DIALOG */}
          <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingCategory ? "Edit Category" : "New Category"}</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); saveCategory.mutate({ name: fd.get("name"), slug: fd.get("slug"), description: fd.get("description"), display_order: parseInt(fd.get("order") as string) || 0 }); }}>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input name="name" defaultValue={editingCategory?.name || ""} required /></div>
                  <div><Label>Slug</Label><Input name="slug" defaultValue={editingCategory?.slug || ""} /></div>
                  <div><Label>Description</Label><Textarea name="description" defaultValue={editingCategory?.description || ""} rows={2} /></div>
                  <div><Label>Order</Label><Input name="order" type="number" defaultValue={editingCategory?.display_order || 0} /></div>
                  <div className="flex justify-end gap-3"><Button variant="outline" type="button" onClick={() => setShowCategoryDialog(false)}>Cancel</Button><Button type="submit">Save</Button></div>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* TAG DIALOG */}
          <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingTag ? "Edit Tag" : "New Tag"}</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); saveTag.mutate({ name: fd.get("name"), slug: fd.get("slug") }); }}>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input name="name" defaultValue={editingTag?.name || ""} required /></div>
                  <div><Label>Slug</Label><Input name="slug" defaultValue={editingTag?.slug || ""} /></div>
                  <div className="flex justify-end gap-3"><Button variant="outline" type="button" onClick={() => setShowTagDialog(false)}>Cancel</Button><Button type="submit">Save</Button></div>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* AUTHOR DIALOG */}
          <Dialog open={showAuthorDialog} onOpenChange={setShowAuthorDialog}>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingAuthor ? "Edit Author" : "New Author"}</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); saveAuthor.mutate({ name: fd.get("name"), slug: fd.get("slug"), role: fd.get("role"), bio: fd.get("bio"), avatar_url: fd.get("avatar_url") }); }}>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input name="name" defaultValue={editingAuthor?.name || ""} required /></div>
                  <div><Label>Slug</Label><Input name="slug" defaultValue={editingAuthor?.slug || ""} /></div>
                  <div><Label>Role</Label><Input name="role" defaultValue={editingAuthor?.role || ""} /></div>
                  <div><Label>Bio</Label><Textarea name="bio" defaultValue={editingAuthor?.bio || ""} rows={3} /></div>
                  <div><Label>Avatar URL</Label><Input name="avatar_url" defaultValue={editingAuthor?.avatar_url || ""} /></div>
                  <div className="flex justify-end gap-3"><Button variant="outline" type="button" onClick={() => setShowAuthorDialog(false)}>Cancel</Button><Button type="submit">Save</Button></div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogManager;
