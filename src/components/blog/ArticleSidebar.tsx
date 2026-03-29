import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import ArticleCard from "./ArticleCard";

interface ArticleSidebarProps {
  currentPostId?: string;
  categoryId?: string;
}

const ArticleSidebar = ({ currentPostId, categoryId }: ArticleSidebarProps) => {
  const { data: popular } = useQuery({
    queryKey: ["blog-popular"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*, blog_authors(name), blog_categories(name, slug)")
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: related } = useQuery({
    queryKey: ["blog-related", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const { data } = await supabase
        .from("blog_posts")
        .select("*, blog_authors(name), blog_categories(name, slug)")
        .eq("status", "published")
        .eq("category_id", categoryId)
        .neq("id", currentPostId || "")
        .order("published_at", { ascending: false })
        .limit(4);
      return data || [];
    },
    enabled: !!categoryId,
  });

  const { data: categories } = useQuery({
    queryKey: ["blog-categories-sidebar"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_categories")
        .select("*")
        .order("display_order");
      return data || [];
    },
  });

  return (
    <aside className="space-y-8">
      {related && related.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Related Articles</h3>
          <div className="space-y-1">
            {related.map((p: any) => (
              <ArticleCard
                key={p.id} variant="compact" title={p.title} slug={p.slug}
                abstract={p.abstract} coverImageUrl={p.cover_image_url}
                readingTimeMinutes={p.reading_time_minutes}
              />
            ))}
          </div>
        </div>
      )}

      {popular && popular.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Most Read</h3>
          <div className="space-y-1">
            {popular.filter((p: any) => p.id !== currentPostId).slice(0, 4).map((p: any) => (
              <ArticleCard
                key={p.id} variant="compact" title={p.title} slug={p.slug}
                abstract={p.abstract} coverImageUrl={p.cover_image_url}
                readingTimeMinutes={p.reading_time_minutes}
              />
            ))}
          </div>
        </div>
      )}

      {categories && categories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map((c: any) => (
              <Link
                key={c.id} to={`/insights/category/${c.slug}`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default ArticleSidebar;
