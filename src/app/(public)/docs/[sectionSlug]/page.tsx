import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRight, FolderOpen } from "lucide-react";

type Props = {
  params: {
    sectionSlug: string;
  };
};

export const dynamic = "force-dynamic";


export default async function SectionPage({ params }: Props) {
  const { sectionSlug } = params;

  // 1. Récupérer la section et ses articles
  const { data: section, error } = await supabase
    .from("sections")
    .select(`
      *,
      articles (
        title,
        slug,
        order_index,
        content 
      )
    `)
    .eq("slug", sectionSlug)
    .single();

  if (error || !section) {
    notFound();
  }

  // Trier les articles par order_index
  const sortedArticles = section.articles?.sort((a: any, b: any) => a.order_index - b.order_index) || [];

  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-border/50 pb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-primary/80" />
          {section.title}
        </h1>
        {section.description && (
          <p className="text-lg text-muted-foreground">
            {section.description}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sortedArticles.length > 0 ? (
          sortedArticles.map((article: any) => (
            <Link 
              key={article.slug} 
              href={`/docs/${section.slug}/${article.slug}`}
              className="group block"
            >
              <Card className="h-full transition-all duration-200 hover:border-primary/50 hover:bg-secondary/30">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg group-hover:text-primary transition-colors">
                    {article.title}
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {/* On essaie d'extraire un extrait du HTML brut pour la description */}
                    {article.content?.replace(/<[^>]*>?/gm, "").substring(0, 100)}...
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-2 py-12 text-center text-muted-foreground border border-dashed rounded-lg">
            Aucun article publié dans cette section pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
