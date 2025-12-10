// import { notFound } from "next/navigation";
// import { supabase } from "@/lib/supabase";
// import { Metadata } from "next";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Clock, Calendar } from "lucide-react";
// import { format } from "date-fns";
// import { fr } from "date-fns/locale";

// type Props = {
//   params: {
//     sectionSlug: string;
//     articleSlug: string;
//   };
// };

// export const revalidate = 60; // Revalider le cache (ISR) toutes les 60 secondes

// // Génération des métadonnées SEO
// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { sectionSlug, articleSlug } = params;

//   const { data: section } = await supabase
//       .from("sections")
//       .select("title")
//       .eq("slug", sectionSlug)
//       .single();

//   const { data: article } = await supabase
//     .from("articles")
//     .select("title, content")
//     .eq("slug", articleSlug)
//     /* .eq("sections.slug", sectionSlug) -- Idéalement on joint, mais faisons simple pour l'instant */
//     .single();

//   if (!article) {
//     return { title: "Article non trouvé | Astral Wiki" };
//   }

//   return {
//     title: `${article.title} - ${section?.title || "Docs"} | Astral Wiki`,
//     description: article.content?.substring(0, 150).replace(/<[^>]*>?/gm, "") + "...", // Strip HTML simple
//   };
// }

// // Composant de Page
// export default async function ArticlePage({ params }: Props) {
//   const { sectionSlug, articleSlug } = params;

//   // 1. Récupérer l'article et sa section parente
//   // Note: Supabase join syntax is powerful. 
//   // On vérifie que l'article appartient bien à la section demandée via la relation.
//   const { data: article, error } = await supabase
//     .from("articles")
//     .select(`
//       *,
//       section:sections!inner (
//         id,
//         title,
//         slug
//       )
//     `)
//     .eq("slug", articleSlug)
//     .eq("section.slug", sectionSlug)   // Filtre sur la table jointe "sections"
//     .eq("is_published", true)
//     .single();

//   if (error || !article) {
//     console.error("Error fetching article:", error);
//     notFound(); 
//   }

//   return (
//     <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
//       {/* Header de l'article */}
//       <div className="space-y-4">
//         <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
//            <span className="capitalize">{article.section.title}</span>
//            <span>/</span>
//            <span className="text-foreground">{article.title}</span>
//         </div>

//         <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
//           {article.title}
//         </h1>

//         <div className="flex items-center gap-4 text-sm text-muted-foreground">
//            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
//               Publié
//            </Badge>
           
//            <div className="flex items-center gap-1.5">
//              <Calendar className="h-4 w-4" />
//              {article.created_at && format(new Date(article.created_at), "d MMMM yyyy", { locale: fr })}
//            </div>

//            {article.updated_at && article.updated_at !== article.created_at && (
//              <>
//                <Separator orientation="vertical" className="h-4" />
//                <div className="flex items-center gap-1.5" title="Dernière mise à jour">
//                  <Clock className="h-4 w-4" />
//                  Mis à jour le {format(new Date(article.updated_at), "d MMM yyyy", { locale: fr })}
//                </div>
//              </>
//            )}
//         </div>
//       </div>

//       <Separator className="bg-border/50" />

//       {/* Contenu de l'article */}
//       <article 
//         className="prose prose-invert prose-lg max-w-none 
//         prose-headings:font-bold prose-headings:tracking-tight
//         prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border/50 prose-h2:pb-2
//         prose-h3:text-xl prose-h3:mt-8 prose-h3:text-primary/90
//         prose-p:leading-relaxed prose-p:text-muted-foreground
//         prose-strong:text-foreground
//         prose-ul:my-6 prose-li:my-2
//         prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
//         "
//       >
//         {/* Rendu HTML Sécurisé (plus tard on utilisera un parser Tiptap React mais pour l'instant HTML brut) */}
//         <div dangerouslySetInnerHTML={{ __html: article.content }} />
//       </article>

//     </div>
//   );
// }
