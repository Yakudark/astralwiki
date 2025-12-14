"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Edit, Trash2, Plus, FileText, ExternalLink, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser"; // For client-side fetching
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionsManager } from "./components/SectionsManager";
import { DeleteArticleButton } from "./components/DeleteArticleButton";
import { SortableTableBody } from "./components/SortableTableBody";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "react-hot-toast";

// Composant SortableItem pour les lignes du tableau
// Ce composant est maintenant déplacé dans SortableTableBody.tsx
// function SortableItem({ children, id }: { children: React.ReactNode, id: string }) {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id });
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     cursor: 'grab',
//   };

//   return (
//     <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
//       {children}
//     </TableRow>
//   );
// }

export default function ContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSectionId = searchParams.get("section") || "all"; // Modifier ici pour utiliser "all"

  const [articles, setArticles] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>(initialSectionId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleArticleDeletedLocally = (deletedArticleId: string) => {
    setArticles(prevArticles => prevArticles.filter(article => article.id !== deletedArticleId));
  };

  // DND Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fonction de gestion du glisser-déposer (maintenant dans le parent)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    console.log("Drag ended. Active ID:", active.id, "Over ID:", over?.id);

    if (active.id !== over?.id) {
      const oldIndex = articles.findIndex((item) => item.id === active.id);
      const newIndex = articles.findIndex((item) => item.id === over?.id);

      if (oldIndex === -1 || newIndex === -1) {
        console.log("Invalid indices. Old: ", oldIndex, "New: ", newIndex); 
        return;
      }

      const newOrderedArticles = [...articles];
      const [movedItem] = newOrderedArticles.splice(oldIndex, 1);
      newOrderedArticles.splice(newIndex, 0, movedItem);

      console.log("Updating local state with new order:", newOrderedArticles.map(a => a.id)); 
      setArticles(newOrderedArticles);

      const reorderedArticlesForApi = newOrderedArticles.map((item, index) => ({
        id: item.id,
        order_index: index,
      }));

      console.log("Sending reorder data to API:", reorderedArticlesForApi); 

      try {
        const response = await fetch("/api/admin/articles/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reorderedArticlesForApi),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error Response:", errorData); 
          throw new Error(errorData.error || "Erreur lors de la réorganisation des articles.");
        }

        toast.success("Ordre des articles mis à jour avec succès !");
        console.log("API call successful."); 
      } catch (apiError: any) {
        toast.error(apiError.message || "La réorganisation a échoué.");
        console.error("Caught API error:", apiError); 
        setArticles(articles); 
      }
    }
  };

  useEffect(() => {
    async function fetchContent() {
      setLoading(true);
      setError(null);
      try {
        const supabase = supabaseBrowser; // Use browser client for client component

        let articlesQuery = supabase
            .from("articles")
            .select(`
              id, 
              title, 
              slug, 
              is_published, 
              updated_at,
              order_index,
              section:sections (
                id,
                title,
                category,
                slug
              )
            `)
            .order("order_index", { ascending: true }) // Trier par order_index
            .order("updated_at", { ascending: false }); // Puis par updated_at
            
        // Appliquer le filtre de section uniquement si une section est sélectionnée (pas "all" ou vide)
        if (selectedSection && selectedSection !== "all") {
            articlesQuery = articlesQuery.eq("section_id", selectedSection);
        }

          const [articlesRes, sectionsRes] = await Promise.all([
            articlesQuery, // Utilisez la requête d'articles modifiée
            supabase
              .from("sections")
              .select("*")
              .order("title")
          ]);

        if (articlesRes.error) throw articlesRes.error;
        if (sectionsRes.error) throw sectionsRes.error;

        setArticles(articlesRes.data || []);
        setSections(sectionsRes.data || []);

      } catch (err: any) {
        console.error("Erreur lors du chargement du contenu:", err);
        setError(err.message || "Erreur lors du chargement du contenu.");
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [selectedSection]); // Re-fetch when selectedSection changes

  // Update URL search params when selectedSection changes
  useEffect(() => {
    // Obtenir les searchParams directement de l'URL actuelle pour éviter les problèmes de référence dans les dépendances
    const currentSearchParams = new URLSearchParams(window.location.search);
    const currentSectionParamInUrl = currentSearchParams.get("section");
    console.log("currentSectionParamInUrl (from URL - fresh):", currentSectionParamInUrl); // Debugging

    // Déterminer la valeur souhaitée pour le paramètre 'section' dans l'URL
    let desiredSectionParamForUrl: string = ""; // Utiliser une chaîne vide pour "pas de section" ou "toutes les sections"
    if (selectedSection && selectedSection !== "all") {
      desiredSectionParamForUrl = selectedSection;
    }
    console.log("desiredSectionParamForUrl (based on state):", desiredSectionParamForUrl); // Debugging

    // Normaliser le paramètre actuel de l'URL pour la comparaison (null devient chaîne vide)
    const normalizedCurrentSectionParam = currentSectionParamInUrl === null ? "" : currentSectionParamInUrl;

    // Vérifier si le paramètre de l'URL a réellement besoin de changer
    if (desiredSectionParamForUrl !== normalizedCurrentSectionParam) {
      console.log("Section param in URL needs update. Replacing URL..."); // Debugging
      const newParams = new URLSearchParams();
      if (desiredSectionParamForUrl) { // Ne définir le paramètre que si c'est un ID de section spécifique
        newParams.set("section", desiredSectionParamForUrl);
      }
      // Si desiredSectionParamForUrl est "", newParams.toString() sera vide, ce qui mènera à /admin/content
      router.replace(`/admin/content${newParams.toString() ? `?${newParams.toString()}` : ''}`);
    } else {
      console.log("Section param in URL is already correct. No action."); // Debugging
    }
  }, [selectedSection, router]); // searchParams retiré des dépendances

  const draftsCount = articles.filter(a => !a.is_published).length;
  const publishedCount = articles.filter(a => a.is_published).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-white">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Chargement du contenu...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Erreur: {error}</div>;
  }

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Gestion du Contenu</h1>
           <p className="text-muted-foreground">Gérez vos articles, guides et règlements.</p>
        </div>
        <div className="flex items-center gap-2">
            <Select onValueChange={setSelectedSection} value={selectedSection}>
                <SelectTrigger className="w-[180px] bg-black/20 border-white/10 text-white">
                    <SelectValue placeholder="Filtrer par section" />
                </SelectTrigger>
                <SelectContent className="bg-background text-white border-white/10">
                    <SelectGroup>
                        <SelectLabel>Sections</SelectLabel>
                        <SelectItem value="all">Toutes les sections</SelectItem>
                        {sections.map(section => (
                            <SelectItem key={section.id} value={section.id}>{section.title}</SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Link href="/admin/content/new">
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Nouvel Article
                </Button>
            </Link>
        </div>
      </div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 mb-8">
          <TabsTrigger value="articles">Tous les articles ({articles?.length || 0})</TabsTrigger>
          <TabsTrigger value="published">Publiés ({publishedCount})</TabsTrigger>
          <TabsTrigger value="drafts">Brouillons ({draftsCount})</TabsTrigger>
          <TabsTrigger value="sections">Sections ({sections?.length || 0})</TabsTrigger>
        </TabsList>

        {/* --- Onglet Articles --- */}
        <TabsContent value="articles" className="space-y-4">
            <div className="rounded-md border border-white/10 bg-card/60 backdrop-blur-sm">
                <DndContext 
                  sensors={sensors} 
                  collisionDetection={closestCenter} 
                  onDragEnd={handleDragEnd}
                >
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
                    {articles && articles.length > 0 ? (
                        <TableBody>
                          <SortableTableBody articles={articles} onArticleDeletedLocally={handleArticleDeletedLocally} />
                        </TableBody>
                    ) : (
                        <TableBody>
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                Aucun article trouvé. Commencez par en créer un !
                            </TableCell>
                        </TableRow>
                        </TableBody>
                        )}
                  </Table>
                </DndContext>
            </div>
        </TabsContent>

        {/* --- Onglet Publiés --- */}
        <TabsContent value="published" className="space-y-4">
            <div className="rounded-md border border-white/10 bg-card/60 backdrop-blur-sm">
                <DndContext 
                  sensors={sensors} 
                  collisionDetection={closestCenter} 
                  onDragEnd={handleDragEnd}
                >
                  <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead className="w-[300px]">Titre</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Dernière modif.</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    {articles && articles.filter((a: any) => a.is_published).length > 0 ? (
                        <TableBody>
                          <SortableTableBody 
                            articles={articles.filter((a: any) => a.is_published)} 
                            onArticleDeletedLocally={handleArticleDeletedLocally}
                          />
                        </TableBody>
                    ) : (
                        <TableBody>
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                Aucun article publié pour le moment.
                            </TableCell>
                        </TableRow>
                        </TableBody>
                        )}
                  </Table>
                </DndContext>
            </div>
        </TabsContent>

        {/* --- Onglet Brouillons --- */}
        <TabsContent value="drafts" className="space-y-4">
            <div className="rounded-md border border-white/10 bg-card/60 backdrop-blur-sm">
                <DndContext 
                  sensors={sensors} 
                  collisionDetection={closestCenter} 
                  onDragEnd={handleDragEnd}
                >
                  <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead className="w-[300px]">Titre</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Dernière modif.</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    {articles && articles.filter(a => !a.is_published).length > 0 ? (
                        <TableBody>
                          <SortableTableBody 
                            articles={articles.filter(a => !a.is_published)} 
                            onArticleDeletedLocally={handleArticleDeletedLocally}
                          />
                        </TableBody>
                    ) : (
                        <TableBody>
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                Aucun brouillon. Tous vos articles sont publiés !
                            </TableCell>
                        </TableRow>
                        </TableBody>
                        )}
                  </Table>
                </DndContext>
            </div>
        </TabsContent>

        {/* --- Onglet Sections --- */}
        <TabsContent value="sections">
            <SectionsManager sections={sections} />
        </TabsContent>

      </Tabs>
    </div>
  );
}
