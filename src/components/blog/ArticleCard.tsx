import { Link } from "react-router-dom";
import { Clock, User, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ArticleCardProps {
  title: string;
  slug: string;
  abstract: string;
  coverImageUrl?: string | null;
  authorName?: string;
  categoryName?: string;
  categorySlug?: string;
  publishedAt?: string | null;
  readingTimeMinutes: number;
  audience?: string;
  isFeatured?: boolean;
  isPracticalPriority?: boolean;
  variant?: "default" | "featured" | "compact";
}

const ArticleCard = ({
  title, slug, abstract, coverImageUrl, authorName, categoryName, categorySlug,
  publishedAt, readingTimeMinutes, audience, isFeatured, isPracticalPriority,
  variant = "default",
}: ArticleCardProps) => {
  if (variant === "compact") {
    return (
      <Link to={`/insights/article/${slug}`} className="group flex gap-4 py-3 border-b border-border last:border-0">
        {coverImageUrl && (
          <img src={coverImageUrl} alt={title} className="w-16 h-16 rounded-lg object-cover shrink-0" loading="lazy" />
        )}
        <div className="min-w-0">
          <h4 className="text-sm font-medium text-foreground group-hover:text-primary/80 transition-colors line-clamp-2">{title}</h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{readingTimeMinutes} min read</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link to={`/insights/article/${slug}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border">
          {coverImageUrl && (
            <div className="aspect-[21/9] overflow-hidden">
              <img src={coverImageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
            </div>
          )}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              {categoryName && (
                <Badge variant="secondary" className="text-xs font-medium">{categoryName}</Badge>
              )}
              {isPracticalPriority && (
                <Badge className="bg-emerald-100 text-emerald-800 text-xs">Practical</Badge>
              )}
              {isFeatured && (
                <Badge className="bg-amber-100 text-amber-800 text-xs">Featured</Badge>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary/80 transition-colors mb-3 leading-tight">{title}</h2>
            <p className="text-muted-foreground text-base leading-relaxed line-clamp-3 mb-6">{abstract}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {authorName && (
                <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{authorName}</span>
              )}
              {publishedAt && (
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{format(new Date(publishedAt), "d MMM yyyy")}</span>
              )}
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{readingTimeMinutes} min read</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/insights/article/${slug}`} className="group block">
      <div className="overflow-hidden rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300">
        {coverImageUrl && (
          <div className="aspect-[16/9] overflow-hidden">
            <img src={coverImageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            {categoryName && (
              <Badge variant="secondary" className="text-xs">{categoryName}</Badge>
            )}
            {audience && audience !== "general" && (
              <Badge variant="outline" className="text-xs capitalize">{audience}</Badge>
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary/80 transition-colors mb-2 leading-snug line-clamp-2">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{abstract}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{authorName || "Staff"}</span>
            <div className="flex items-center gap-3">
              {publishedAt && <span>{format(new Date(publishedAt), "d MMM yyyy")}</span>}
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{readingTimeMinutes}m</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
