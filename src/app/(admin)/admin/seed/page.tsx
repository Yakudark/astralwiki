"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const seedSections = async () => {
    setLoading(true);
    setStatus("idle");
    setMsg("");

    try {
      // 1. Définir les sections par défaut
      const sections = [
        { title: "Règlement Général", slug: "reglement-general", category: "reglement" },
        { title: "Règlement Faction", slug: "reglement-faction", category: "reglement" },
        { title: "Règlement Crime", slug: "reglement-crime", category: "reglement" },
        
        { title: "Histoire & Lore", slug: "histoire-lore", category: "rp" },
        { title: "Géopolitique", slug: "geopolitique", category: "rp" },
        { title: "Technologies", slug: "technologies", category: "rp" },
        
        { title: "Guide du Débutant", slug: "guide-debutant", category: "guide" },
        { title: "Création de Personnage", slug: "creation-personnage", category: "guide" },
        { title: "Commandes Serveur", slug: "commandes-serveur", category: "guide" },
      ];

      // 2. Insérer (ou ignorer si existe déjà via slug unique potentiellement, mais ici on insert simple)
      // On vérifie d'abord pour éviter les doublons si pas de contrainte unique
      let insertedCount = 0;
      for (const s of sections) {
         const { data: existing } = await supabaseBrowser.from('sections').select('id').eq('slug', s.slug).single();
         if (!existing) {
            const { error } = await supabaseBrowser.from('sections').insert(s);
            if (error) throw error;
            insertedCount++;
         }
      }

      setStatus("success");
      setMsg(`${insertedCount} sections ont été créées avec succès.`);

    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMsg(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-20 text-white space-y-8">
       <div>
         <h1 className="text-3xl font-bold">Initialisation de la Base de Données</h1>
         <p className="text-muted-foreground">Utilitaire pour injecter les données de base.</p>
       </div>

       <Card className="bg-card/20 border-white/10">
          <CardHeader>
             <CardTitle>Sections par défaut</CardTitle>
             <CardDescription>
                Crée les catégories (Règlement, RP, Guides) nécessaires pour créer des articles.
             </CardDescription>
          </CardHeader>
          <CardContent>
             {status === 'success' && (
                 <Alert className="mb-4 bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Succès</AlertTitle>
                    <AlertDescription>{msg}</AlertDescription>
                 </Alert>
             )}
             {status === 'error' && (
                 <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{msg}</AlertDescription>
                 </Alert>
             )}

             <Button 
                onClick={seedSections} 
                disabled={loading} 
                className="w-full"
                variant={status === 'success' ? "outline" : "default"}
             >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {status === 'success' ? "Données injectées" : "Injecter les Sections"}
             </Button>

             <div className="mt-4 text-center">
                <Link href="/admin/content/new" className="text-sm text-blue-400 hover:underline">
                   Retourner à la création d'article →
                </Link>
             </div>
          </CardContent>
       </Card>
    </div>
  );
}
