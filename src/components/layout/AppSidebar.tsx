"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BookOpen, Shield, Home, Search, ChevronRight, Hash, Gavel, Map as MapIcon, ChevronDown, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import type { Section } from "@/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Type pour un article avec ses sous-articles
type Article = {
  id: string;
  title: string;
  slug: string;
  section_id: string;
  parent_article_id: string | null;
  subArticles?: Article[];
};

// Composant pour un lien d'article avec ses sous-articles
const ArticleLink = ({ 
  article, 
  sectionSlug, 
  pathname, 
  level = 0 
}: { 
  article: Article; 
  sectionSlug: string; 
  pathname: string | null; 
  level?: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const articlePath = `/docs/${sectionSlug}/${article.slug}`;
  const isActive = pathname === articlePath;
  const hasSubArticles = article.subArticles && article.subArticles.length > 0;

  // Auto-ouvrir si un sous-article est actif
  useEffect(() => {
    if (hasSubArticles && article.subArticles?.some(sub => pathname === `/docs/${sectionSlug}/${sub.slug}`)) {
      setIsOpen(true);
    }
  }, [pathname, hasSubArticles, article.subArticles, sectionSlug]);

  return (
    <div>
      <div className="flex items-center gap-1">
        {hasSubArticles && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-white/5 rounded transition-colors"
          >
            <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", isOpen ? "" : "-rotate-90")} />
          </button>
        )}
        <Link
          href={articlePath}
          className={cn(
            "flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 group font-medium text-xs border-l border-white/5",
            level > 0 && "ml-4",
            !hasSubArticles && "ml-5",
            isActive
              ? "bg-secondary text-foreground border-l-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5 hover:border-l-white/20"
          )}
        >
          <FileText className={cn("h-3 w-3 transition-colors shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
          <span className="flex-1 truncate">{article.title}</span>
          {isActive && <ChevronRight className="h-3 w-3 text-primary animate-in fade-in slide-in-from-left-1 shrink-0" />}
        </Link>
      </div>
      
      {hasSubArticles && isOpen && (
        <div className="ml-2 mt-0.5 space-y-0.5">
          {article.subArticles!.map((subArticle) => (
            <ArticleLink 
              key={subArticle.id} 
              article={subArticle} 
              sectionSlug={sectionSlug} 
              pathname={pathname}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Composant pour une section avec ses articles
const SectionItem = ({
  section,
  articles,
  pathname
}: {
  section: Section;
  articles: Article[];
  pathname: string | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const sectionArticles = articles.filter(a => a.section_id === section.id && !a.parent_article_id);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between text-sm font-semibold h-8 hover:bg-white/5 px-3 text-foreground/90"
        >
          <span className="flex items-center gap-2 truncate">
            {section.title}
          </span>
          <ChevronDown className={cn("h-3 w-3 transition-transform shrink-0", isOpen ? "" : "-rotate-90")} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 mt-1">
        {sectionArticles.length > 0 ? (
          sectionArticles.map((article) => (
            <ArticleLink 
              key={article.id}
              article={article}
              sectionSlug={section.slug}
              pathname={pathname}
            />
          ))
        ) : (
          <p className="px-5 py-2 text-xs text-muted-foreground/50 italic">Aucun article</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

// Composant de Catégorie Dépliable avec sections
const SidebarCategory = ({ 
    title, 
    icon: Icon, 
    sections, 
    articles,
    pathname, 
    colorClass
}: { 
    title: string, 
    icon: any, 
    sections: Section[], 
    articles: Article[],
    pathname: string | null, 
    colorClass: string 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
            <CollapsibleTrigger asChild>
                <Button 
                    variant="ghost" 
                    className={cn(
                        "w-full justify-between font-bold uppercase tracking-widest text-xs h-9 hover:bg-white/5 px-2",
                        colorClass
                    )}
                >
                    <span className="flex items-center gap-2">
                        <Icon className="h-3 w-3" />
                        {title}
                    </span>
                    <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isOpen ? "" : "-rotate-90")} />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1.5 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                {sections.map((section) => (
                  <SectionItem
                    key={section.id}
                    section={section}
                    articles={articles}
                    pathname={pathname}
                  />
                ))}
            </CollapsibleContent>
        </Collapsible>
    );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [sections, setSections] = useState<Section[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createSupabaseClient();
      
      const [sectionsRes, articlesRes] = await Promise.all([
        supabase.from("sections").select("*").order("order_index", { ascending: true }),
        supabase.from("articles").select("id, title, slug, section_id, parent_article_id, order_index").eq("is_published", true).order("order_index", { ascending: true })
      ]);
      
      if (sectionsRes.data) {
        setSections(sectionsRes.data as Section[]);
      }
      
      if (articlesRes.data) {
        // Organiser les articles en hiérarchie
        const articlesMap = new Map<string, Article>();
        const rootArticles: Article[] = [];
        
        // Créer une map de tous les articles
        articlesRes.data.forEach((article: any) => {
          articlesMap.set(article.id, { ...article, subArticles: [] });
        });
        
        // Construire la hiérarchie
        articlesMap.forEach((article) => {
          if (article.parent_article_id) {
            const parent = articlesMap.get(article.parent_article_id);
            if (parent) {
              parent.subArticles!.push(article);
            }
          } else {
            rootArticles.push(article);
          }
        });
        
        setArticles(rootArticles);
      }
      
      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-screen w-64 bg-sidebar/50 backdrop-blur-xl border-r border-sidebar-border shadow-2xl fixed left-0 top-0 z-40 hidden md:flex overflow-hidden">
      {/* Header / Brand */}
      <div className="p-6 border-b border-sidebar-border flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
             <span className="text-primary font-bold text-lg">A</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground/90">
            Astral<span className="text-primary">Wiki</span>
          </span>
        </Link>
        
        <Link href="/admin/login" title="Administration">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                <Shield className="h-4 w-4" />
            </Button>
        </Link>
      </div>

      {/* Search Trigger */}
      <div className="px-4 py-4 shrink-0">
        <Button variant="outline" className="w-full justify-start text-muted-foreground bg-background/50 border-input/50 hover:bg-primary/10 hover:text-primary transition-all group">
          <Search className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
          Rechercher...
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-auto">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* Navigation - Scrollable Area */}
      <ScrollArea className="flex-1 min-h-0 px-4">
        {/* Groupe Accueil (Fixe) */}
        <div className="space-y-1 py-2 mb-4">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group font-medium text-sm",
                pathname === "/"
                  ? "bg-primary/15 text-primary shadow-[0_0_15px_-5px_var(--primary)] border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <Home className={cn("h-4 w-4 transition-colors", pathname === "/" ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
              Accueil
            </Link>
        </div>

        {loading ? (
           // Skeleton
           <div className="space-y-6">
             {[1, 2, 3].map((i) => (
               <div key={i} className="space-y-2">
                 <div className="h-3 w-20 bg-muted/30 rounded animate-pulse" />
                 <div className="h-8 w-full bg-muted/20 rounded animate-pulse" />
                 <div className="h-8 w-full bg-muted/20 rounded animate-pulse" />
               </div>
             ))}
           </div>
        ) : (
          <div className="space-y-6 pb-10">
            
            <SidebarCategory 
                title="Règlement" 
                icon={BookOpen} 
                sections={sections.filter(s => s.category === 'reglement')} 
                articles={articles}
                pathname={pathname}
                colorClass="text-primary/80"
            />

            <SidebarCategory 
                title="Documents RP" 
                icon={Shield} 
                sections={sections.filter(s => s.category === 'rp')} 
                articles={articles}
                pathname={pathname}
                colorClass="text-blue-400/80"
            />

            <SidebarCategory 
                title="Guides & Aide" 
                icon={MapIcon} 
                sections={sections.filter(s => s.category === 'guide')} 
                articles={articles}
                pathname={pathname}
                colorClass="text-emerald-400/80"
            />

          </div>
        )}
      </ScrollArea>

      {/* Footer / User Info */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar/30 shrink-0">
          <div className="text-xs text-center text-muted-foreground">
             &copy; 2024 AstralWiki
          </div>
      </div>
    </div>
  );
}
