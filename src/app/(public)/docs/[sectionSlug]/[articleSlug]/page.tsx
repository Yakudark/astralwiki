import { notFound } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Props = {
  params: {
    sectionSlug: string;
    articleSlug: string;
  };
};

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: Props) {
  const { sectionSlug, articleSlug } = await params;
  const supabase = createSupabaseClient();

  // Récupérer l'article avec sa section
  const { data: article, error } = await supabase
    .from("articles")
    .select(`
      *,
      section:sections (
        title,
        slug
      )
    `)
    .eq("slug", articleSlug)
    .eq("is_published", true)
    .single();

  if (error || !article) {
    notFound();
  }

  // Vérifier que l'article appartient bien à la section demandée
  if ((article.section as any)?.slug !== sectionSlug) {
    notFound();
  }

  // Récupérer les sous-articles (si l'article en a)
  const { data: subArticles } = await supabase
    .from("articles")
    .select("id, title, slug, content")
    .eq("parent_article_id", article.id)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Breadcrumb / Navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <Link 
          href={`/docs/${sectionSlug}`} 
          className="hover:text-foreground transition-colors"
        >
          {(article.section as any)?.title}
        </Link>
        <span>/</span>
        <span className="text-foreground">{article.title}</span>
      </div>

      {/* Article Header */}
      <div className="space-y-4 border-b border-border/50 pb-6">
        <Link href={`/docs/${sectionSlug}`}>
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Retour à {(article.section as any)?.title}
          </Button>
        </Link>

        <h1 className="text-4xl font-bold tracking-tight">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {article.updated_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Mis à jour le {format(new Date(article.updated_at), "d MMMM yyyy", { locale: fr })}
            </div>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div 
        className="prose prose-invert prose-lg max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-muted-foreground prose-p:leading-7 prose-p:my-4
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:text-foreground prose-strong:font-semibold
          prose-ul:my-4 prose-li:my-2
          prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1
          prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-secondary prose-pre:border prose-pre:border-border"
        dangerouslySetInnerHTML={{ __html: article.content || "" }}
      />

      {/* Sub-Articles Section */}
      {subArticles && subArticles.length > 0 && (
        <div className="pt-8 border-t border-border/50 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Articles liés</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {subArticles.map((subArticle: any) => (
              <Link 
                key={subArticle.id}
                href={`/docs/${sectionSlug}/${subArticle.slug}`}
                className="group block"
              >
                <Card className="h-full transition-all duration-200 hover:border-primary/50 hover:bg-secondary/30 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center justify-between">
                      {subArticle.title}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {subArticle.content?.replace(/<[^>]*>?/gm, "").substring(0, 100)}...
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-border/50">
        <Link href={`/docs/${sectionSlug}`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voir tous les articles de {(article.section as any)?.title}
          </Button>
        </Link>
      </div>
    </div>
  );
}
