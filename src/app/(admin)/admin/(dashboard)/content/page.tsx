
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, FileText, ExternalLink } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const revalidate = 0; // Données fraîches à chaque fois

export default async function ContentPage() {
  
  // Récupérer les articles avec leur section
  const supabase = createSupabaseClient();
  const { data: articles, error } = await supabase
    .from("articles")
    .select(`
      id, 
      title, 
      slug, 
      is_published, 
      updated_at,
      section:sections (
        title,
        category
      )
    `)
    .order("updated_at", { ascending: false });

  if (error) {
     return <div className="text-red-500">Erreur lors du chargement des articles: {error.message}</div>;
  }

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Gestion du Contenu</h1>
           <p className="text-muted-foreground">Gérez vos articles, guides et règlements.</p>
        </div>
        
        <Link href="/admin/content/new">
           <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus className="h-4 w-4" />
              Nouvel Article
           </Button>
        </Link>
      </div>

      <div className="rounded-md border border-white/10 bg-card/60 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead className="w-[300px]">Titre</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Dernière modif.</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles && articles.length > 0 ? (
                articles.map((article) => (
                  <TableRow key={article.id} className="hover:bg-white/5 border-white/5 data-[state=selected]:bg-muted">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {article.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{(article.section as any)?.title}</span>
                        <span className="text-xs text-muted-foreground capitalize">{(article.section as any)?.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {article.is_published ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Publié</Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">Brouillon</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                       { article.updated_at ? format(new Date(article.updated_at), "d MMM yyyy", { locale: fr }) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-2">
                          {/* Voir l'article (si publié) */}
                          {article.is_published && (
                             <Link href={`/docs/${(article.section as any)?.slug}/${article.slug}`} target="_blank">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                             </Link>
                          )}

                          <Link href={`/admin/content/${article.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {/* Delete : Nécessiterait un Client Component pour l'interactivité. On fera une page Edit pour commencer. */}
                          <Button variant="ghost" size="icon" disabled className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10 opacity-50 cursor-not-allowed">
                             <Trash2 className="h-4 w-4" />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
               <TableRow>
                 <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Aucun article trouvé. Commencez par en créer un !
                 </TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
