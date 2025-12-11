import { notFound } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, FileText, BookOpen, Shield, Map } from "lucide-react";

type Props = {
  params: {
    categorySlug: string;
  };
};

export const dynamic = "force-dynamic";

const CATEGORY_INFO: Record<string, { title: string; description: string; icon: any; color: string }> = {
  reglement: {
    title: "Règlements",
    description: "Tous les règlements et directives du serveur",
    icon: BookOpen,
    color: "text-primary"
  },
  rp: {
    title: "Documents RP",
    description: "Lois, procédures et documents officiels",
    icon: Shield,
    color: "text-blue-400"
  },
  guide: {
    title: "Guides & Aide",
    description: "Guides et tutoriels pour bien démarrer",
    icon: Map,
    color: "text-emerald-400"
  }
};

export default async function CategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  const supabase = createSupabaseClient();

  const categoryInfo = CATEGORY_INFO[categorySlug];
  if (!categoryInfo) {
    notFound();
  }

  // Récupérer tous les articles publiés de cette catégorie
  const { data: articles, error } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      slug,
      content,
      order_index,
      section:sections (
        title,
        slug,
        category
      )
    `)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (error) {
    console.error(error);
    notFound();
  }

  // Filtrer les articles de cette catégorie
  const filteredArticles = articles?.filter(
    (article: any) => article.section?.category === categorySlug
  ) || [];

  const Icon = categoryInfo.icon;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-border/50 pb-6">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <Icon className={`h-10 w-10 ${categoryInfo.color}`} />
          {categoryInfo.title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {categoryInfo.description}
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article: any) => (
            <Link 
              key={article.id} 
              href={`/docs/${article.section?.slug}/${article.slug}`}
              className="group block h-full"
            >
              <Card className="h-full transition-all duration-200 hover:border-primary/50 hover:bg-secondary/30 hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {article.section?.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {article.content?.replace(/<[^>]*>?/gm, "").substring(0, 150)}...
                  </p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto mt-3 text-primary group-hover:underline"
                  >
                    En savoir plus →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
            Aucun article publié dans cette catégorie pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
