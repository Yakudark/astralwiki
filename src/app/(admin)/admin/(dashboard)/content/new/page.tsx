"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Editor } from "@/components/editor/Editor";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils"; // Il faudra s'assurer que cette fonction existe ou l'implémenter inline
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helper simple pour slugifier
function generateSlug(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with -
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
}

export default function NewArticlePage() {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [content, setContent] = useState("<p>Commencez à rédiger...</p>");
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les sections disponibles
  useEffect(() => {
    async function loadSections() {
const { data } = await supabaseBrowser.from("sections").select(...)
      if (data) setSections(data);
      setInitLoading(false);
    }
    loadSections();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
       // Only update if slug hasn't been manually edited heavily? 
       // For simplicity, let's just update if slug is empty or matches previous title slug
       setSlug(generateSlug(title));
    }
  }, [title]);

  const handleSubmit = async (publish: boolean) => {
    if (!title || !slug || !sectionId) {
      setError("Merci de remplir tous les champs obligatoires (Titre, Slug, Section).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabaseBrowser.from('articles').insert({
        title,
        slug,
        section_id: sectionId,
        content,
        is_published: publish,
        order_index: 99 // Put at end by default
      }).select().single();

      if (error) throw error;

      router.push('/admin/content');
      router.refresh();

    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde.");
      setLoading(false);
    }
  };

  if (initLoading) return <div className="p-10 text-white">Chargement...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-white pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/content">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouvel Article</h1>
          <p className="text-sm text-muted-foreground">Créez un nouveau contenu pour le wiki.</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
           <div className="space-y-2">
             <Label>Contenu de l'article</Label>
             <Editor content={content} onChange={setContent} />
           </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
           <Card className="bg-card/50 border-white/10">
             <CardContent className="space-y-4 pt-6">
               
               <div className="space-y-2">
                 <Label htmlFor="title">Titre *</Label>
                 <Input 
                    id="title" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Ex: Règles de base" 
                    className="bg-black/20"
                 />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="slug">Slug URL *</Label>
                 <Input 
                    id="slug" 
                    value={slug} 
                    onChange={e => setSlug(generateSlug(e.target.value))} 
                    placeholder="ex: regles-de-base" 
                    className="bg-black/20 font-mono text-xs"
                 />
                 <p className="text-[10px] text-muted-foreground">URL: /docs/section/{slug || '...'}</p>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="section">Section Parente *</Label>
                 <select 
                    id="section"
                    className="flex h-10 w-full rounded-md border border-input bg-black/20 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={sectionId}
                    onChange={e => setSectionId(e.target.value)}
                 >
                    <option value="">-- Choisir une section --</option>
                    <optgroup label="Règlement">
                       {sections.filter(s => s.category === 'reglement').map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </optgroup>
                    <optgroup label="Documents RP">
                       {sections.filter(s => s.category === 'rp').map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </optgroup>
                    <optgroup label="Guides">
                        {sections.filter(s => s.category === 'guide').map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </optgroup>
                 </select>
               </div>

               <div className="pt-4 flex flex-col gap-2">
                 <Button 
                    variant="default" 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                 >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Publier directement
                 </Button>
                 <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                 >
                    Enregistrer comme brouillon
                 </Button>
               </div>

             </CardContent>
           </Card>
        </div>

      </div>
    </div>
  );
}
