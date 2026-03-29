import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/blog/ArticleCard";
import { ArrowLeft, User } from "lucide-react";
import { Link } from "react-router-dom";

const AuthorPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: author } = useQuery({
    queryKey: ["blog-author", slug],
    queryFn: async () => {
      const { data } = await supabase.from("blog_authors").select("*").eq("slug", slug!).single();
      return data;
    },
    enabled: !!slug,
  });

  const { data: posts } = useQuery({
    queryKey: ["blog-author-posts", author?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*, blog_authors(name, slug), blog_categories(name, slug)")
        .eq("status", "published")
        .eq("author_id", author!.id)
        .order("published_at", { ascending: false });
      return data || [];
    },
    enabled: !!author?.id,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Link to="/insights" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-3.5 w-3.5" />Back to Insights
          </Link>
          
          {author && (
            <div className="flex items-start gap-6 mb-12 p-6 rounded-xl bg-card border border-border">
              {author.avatar_url ? (
                <img src={author.avatar_url} alt={author.name} className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-foreground">{author.name}</h1>
                {author.role && <p className="text-muted-foreground mt-1">{author.role}</p>}
                {author.bio && <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-2xl">{author.bio}</p>}
              </div>
            </div>
          )}

          <h2 className="text-xl font-semibold text-foreground mb-6">Articles by {author?.name || "Author"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(posts || []).map((p: any) => (
              <ArticleCard
                key={p.id} title={p.title} slug={p.slug} abstract={p.abstract}
                coverImageUrl={p.cover_image_url} authorName={p.blog_authors?.name}
                categoryName={p.blog_categories?.name} publishedAt={p.published_at}
                readingTimeMinutes={p.reading_time_minutes} audience={p.audience}
              />
            ))}
          </div>
          {posts?.length === 0 && <p className="text-center text-muted-foreground py-12">No published articles yet.</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuthorPage;
