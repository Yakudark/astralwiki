import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Users, Eye, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const revalidate = 0; // Pas de cache pour l'admin

async function getStats() {
  const { count: articlesCount } = await supabase.from('articles').select('*', { count: 'exact', head: true });
  const { count: sectionsCount } = await supabase.from('sections').select('*', { count: 'exact', head: true });
  // Simulation visites (à connecter à un vrai analytics plus tard)
  const visitsCount = 1254; 
  
  return { articlesCount, sectionsCount, visitsCount };
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
               <div className="flex flex-col gap-4 text-sm text-muted-foreground text-center py-10">
                  <p>Pas encore de contenu récent.</p>
                  {/* Liste à implémenter */}
               </div>
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
               <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary mb-2">
                  Créer un nouvel article
               </div>
               <div className="p-4 rounded-lg bg-secondary/30 border border-white/5">
                  Gérer les sections
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
