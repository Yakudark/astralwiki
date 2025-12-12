import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Users, Eye, Activity } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase";
import Link from "next/link";

export const revalidate = 0; // Pas de cache pour l'admin

async function getStats() {
  const supabase = createSupabaseClient();
  const { count: articlesCount } = await supabase.from('articles').select('*', { count: 'exact', head: true });
  const { count: sectionsCount } = await supabase.from('sections').select('*', { count: 'exact', head: true });
  
  // Récupérer les 3 derniers articles modifiés
  const { data: recentArticles } = await supabase
    .from('articles')
    .select('id, title, updated_at, is_published')
    .order('updated_at', { ascending: false })
    .limit(3);
  
  // Simulation visites (à connecter à un vrai analytics plus tard)
  const visitsCount = 1254; 
  
  return { articlesCount, sectionsCount, visitsCount, recentArticles };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Vaisseau</h1>
        <div className="text-sm text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">
           Status: <span className="text-emerald-400 font-semibold">Opérationnel</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.articlesCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              +2 depuis la semaine dernière
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sections Actives</CardTitle>
            <Users className="h-4 w-4 text-blue-400" /> {/* Icone placeholder */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sectionsCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              3 Piliers principaux
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visiteurs (Mensuel)</CardTitle>
            <Eye className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~{stats.visitsCount}</div>
            <p className="text-xs text-muted-foreground">
              +19% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de lecture</CardTitle>
            <Activity className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4min 30s</div>
            <p className="text-xs text-muted-foreground">
              Temps moyen par session
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Recent Activity / Content List Preview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
         <Card className="col-span-4 bg-card/40 border-white/5">
            <CardHeader>
               <CardTitle>Contenu Récent</CardTitle>
               <CardDescription>
                  Derniers articles modifiés ou publiés.
               </CardDescription>
            </CardHeader>
            <CardContent>
               {stats.recentArticles && stats.recentArticles.length > 0 ? (
                 <div className="space-y-3">
                   {stats.recentArticles.map((article: any) => (
                     <Link 
                       key={article.id} 
                       href={`/admin/content/${article.id}`}
                       className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                     >
                       <div className="flex-1">
                         <p className="font-medium group-hover:text-primary transition-colors">
                           {article.title}
                         </p>
                         <p className="text-xs text-muted-foreground">
                           {article.updated_at ? new Date(article.updated_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                         </p>
                       </div>
                       <div>
                         {article.is_published ? (
                           <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                             Publié
                           </span>
                         ) : (
                           <span className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                             Brouillon
                           </span>
                         )}
                       </div>
                     </Link>
                   ))}
                 </div>
               ) : (
                 <div className="flex flex-col gap-4 text-sm text-muted-foreground text-center py-10">
                   <p>Pas encore de contenu récent.</p>
                 </div>
               )}
            </CardContent>
         </Card>

         <Card className="col-span-3 bg-card/40 border-white/5">
            <CardHeader>
               <CardTitle>Actions Rapides</CardTitle>
               <CardDescription>
                  Raccourcis administration
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {/* Ici on mettra les boutons pour créer un article */}
               <Link href="/admin/content/new" className="block p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary mb-2 hover:bg-primary/20 transition-colors cursor-pointer">
                  Créer un nouvel article
               </Link>
               <Link href="/admin/content" className="block p-4 rounded-lg bg-secondary/30 border border-white/5 hover:bg-secondary/50 transition-colors cursor-pointer text-muted-foreground hover:text-white">
                  Gérer les sections
               </Link>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
