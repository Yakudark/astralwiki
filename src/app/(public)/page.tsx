'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Book, Gavel, Map, Search, ShieldAlert, Sparkles, FileText } from "lucide-react";
import { CommandMenu } from "@/components/shared/CommandMenu";
import { Input } from "@/components/ui/input";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Section {
  id: string;
  title: string;
  slug: string;
  category: string;
  order_index: number;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  section_id: string;
  parent_article_id: string | null;
  is_published: boolean;
  order_index: number;
}

const normalizeString = (str: string) => {
  return str.normalize("NFD").replace(/\u0300-\u036f/g, "").toLowerCase();
};

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [homeSearchQuery, setHomeSearchQuery] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = supabaseBrowser;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [sectionsRes, articlesRes] = await Promise.all([
        supabase.from("sections").select("*").order("order_index", { ascending: true }),
        supabase.from("articles").select("id, title, slug, section_id, is_published").eq("is_published", true).order("order_index", { ascending: true })
      ]);

      if (sectionsRes.data) {
        setSections(sectionsRes.data as Section[]);
      }

      if (articlesRes.data) {
        setArticles(articlesRes.data as Article[]);
      }
      setLoading(false);
    }

    fetchData();
  }, [supabase]);

  // Fonction de filtrage des articles et sections avec normalisation
  const filterContent = (query: string) => {
    if (!query) return { filteredSections: sections, filteredArticles: articles };
    
    const normalizedQuery = normalizeString(query);

    const filteredSections = sections.filter(section => 
      normalizeString(section.title).includes(normalizedQuery) ||
      normalizeString(section.category).includes(normalizedQuery)
    );

    const filteredArticles = articles.filter(article => 
      normalizeString(article.title).includes(normalizedQuery) ||
      sections.some(section => section.id === article.section_id && (
        normalizeString(section.title).includes(normalizedQuery) || 
        normalizeString(section.category).includes(normalizedQuery)
      ))
    );

    return { filteredSections, filteredArticles };
  };

  const { filteredSections, filteredArticles } = filterContent(homeSearchQuery);

  useEffect(() => {
    // Ouvrir/fermer le popover en fonction de la requête de recherche
    setIsPopoverOpen(homeSearchQuery.length > 0 && filteredArticles.length > 0);
  }, [homeSearchQuery, filteredArticles]);

  // Groupes de catégories pour l'affichage
  const categories = [
    { title: "Règlement", icon: Book, categorySlug: "reglement", colorClass: "text-primary" },
    { title: "Documents RP", icon: ShieldAlert, categorySlug: "rp", colorClass: "text-blue-400" },
    { title: "Guides & Aide", icon: Map, categorySlug: "guide", colorClass: "text-emerald-500" },
  ];

  const filteredCategories = categories.filter(category => 
    homeSearchQuery === "" || 
    normalizeString(category.title).includes(normalizeString(homeSearchQuery)) ||
    filteredSections.some(s => s.category === category.categorySlug) ||
    filteredArticles.some(a => 
      sections.some(s => s.id === a.section_id && s.category === category.categorySlug)
    )
  );

  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-sidebar via-background to-primary/5 p-10 md:p-20 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <Badge variant="outline" className="px-4 py-1 text-primary border-primary/50 bg-primary/10 backdrop-blur-md animate-pulse">
            <Sparkles className="mr-2 h-3 w-3" />
            Astral Roleplay V3
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Explorez l'Univers <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Astral</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            La documentation officielle pour maîtriser votre RP. <br className="hidden md:block"/>
            Règles, Lore, Guides et plus encore.
          </p>

          <div className="w-full max-w-md relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
             {/* Input de recherche direct enveloppé dans Popover */}
             <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
               <PopoverTrigger asChild>
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    <Input 
                      type="text" 
                      placeholder="Rechercher un article, une règle..." 
                      className="pl-12 h-14 text-lg bg-background/80 border border-primary/30 text-muted-foreground focus:border-primary transition-all duration-300"
                      value={homeSearchQuery}
                      onChange={(e) => setHomeSearchQuery(e.target.value)}
                    />
                 </div>
               </PopoverTrigger>
               <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 mt-2 max-h-60 overflow-y-auto z-50" onOpenAutoFocus={(e) => e.preventDefault()}>
                 {loading ? (
                   <p className="p-3 text-muted-foreground text-sm">Chargement des articles...</p>
                 ) : filteredArticles.length > 0 ? (
                   filteredArticles.map((article) => (
                       <Link 
                           key={article.id} 
                           href={`/docs/${sections.find(s => s.id === article.section_id)?.slug || 'unknown'}/${article.slug}`}
                           className="flex items-center gap-2 p-3 hover:bg-accent hover:text-accent-foreground text-sm cursor-pointer border-b last:border-b-0 border-border/50"
                           onClick={() => setIsPopoverOpen(false)} 
                       >
                           <FileText className="h-4 w-4 text-muted-foreground" />
                           <span className="flex-1 truncate">{article.title}</span>
                           <span className="text-xs text-muted-foreground">
                               {sections.find(s => s.id === article.section_id)?.title}
                           </span>
                       </Link>
                   ))
                 ) : (
                   <p className="p-3 text-muted-foreground text-sm">Aucun article trouvé.</p>
                 )}
               </PopoverContent>
             </Popover>
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
          <Map className="h-6 w-6 text-primary" />
          Les Piliers d'Astral
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Skeleton Loading
            <> 
              <div className="h-[200px] w-full bg-card/50 rounded-lg animate-pulse"></div>
              <div className="h-[200px] w-full bg-card/50 rounded-lg animate-pulse"></div>
              <div className="h-[200px] w-full bg-card/50 rounded-lg animate-pulse"></div>
            </>
          ) : (
            filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <Link key={category.categorySlug} href={`/docs/category/${category.categorySlug}`} className="group">
                  <Card className="h-full bg-card/50 backdrop-blur-sm border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_-5px_var(--primary)] hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <category.icon className="h-24 w-24 -mr-4 -mt-4 rotate-12" />
                    </div>
                    <CardHeader>
                      <CardTitle className={`text-xl flex items-center gap-2 group-hover:${category.colorClass} transition-colors`}>
                        <category.icon className="h-5 w-5" /> {category.title}
                      </CardTitle>
                      <CardDescription>
                        {category.categorySlug === "reglement" && "Les fondements du serveur."}
                        {category.categorySlug === "rp" && "Lois et procédures officielles."}
                        {category.categorySlug === "guide" && "Pour bien commencer votre aventure."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {category.categorySlug === "reglement" && "Consultez tous les règlements et directives du serveur."}
                        {category.categorySlug === "rp" && "Lois, procédures et documents officiels du serveur."}
                        {category.categorySlug === "guide" && "Guides et tutoriels pour bien démarrer votre aventure."}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground italic">Aucun résultat trouvé pour \"{homeSearchQuery}\".</p>
            )
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="rounded-2xl bg-secondary/30 border border-white/5 p-8 text-center">
         <h3 className="text-xl font-semibold mb-2">Vous ne trouvez pas ce que vous cherchez ?</h3>
         <p className="text-muted-foreground mb-4">Rejoignez le Discord pour poser vos questions au staff.</p>
         <Button variant="default" className="bg-[#5865F2] hover:bg-[#4752C4] text-white">
            Rejoindre le Discord
            <ArrowRight className="ml-2 h-4 w-4" />
         </Button>
      </section>
      <CommandMenu open={isSearchOpen} setOpen={setIsSearchOpen} />
    </div>
  );
}
