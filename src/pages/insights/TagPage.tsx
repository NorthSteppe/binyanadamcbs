import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/blog/ArticleCard";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: tag } = useQuery({
    queryKey: ["blog-tag", slug],
    queryFn: async () => {
      const { data } = await supabase.from("blog_tags").select("*").eq("slug", slug!).single();
      return data;
    },
    enabled: !!slug,
  });

  const { data: posts } = useQuery({
    queryKey: ["blog-tag-posts", tag?.id],
    queryFn: async () => {
      if (!tag) return [];
      const { data: postTags } = await supabase.from("blog_post_tags").select("post_id").eq("tag_id", tag.id);
      if (!postTags?.length) return [];
      const postIds = postTags.map((pt: any) => pt.post_id);
      const { data } = await supabase
        .from("blog_posts")
        .select("*, blog_authors(name, slug), blog_categories(name, slug)")
        .eq("status", "published")
        .in("id", postIds)
        .order("published_at", { ascending: false });
      return data || [];
    },
    enabled: !!tag?.id,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Link to="/insights" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-3.5 w-3.5" />Back to Insights
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-10">Tag: {tag?.name || slug}</h1>
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
          {posts?.length === 0 && <p className="text-center text-muted-foreground py-12">No articles with this tag yet.</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TagPage;
