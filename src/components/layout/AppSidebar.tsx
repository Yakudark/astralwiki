"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BookOpen, Shield, Home, Search, ChevronRight, Hash, Gavel, Map, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import type { Section } from "@/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Composant Helper pour les liens de Sidebar
const SidebarLink = ({ section, pathname, icon }: { section: Section, pathname: string | null, icon?: string }) => {
  const isActive = pathname?.startsWith(`/docs/${section.slug}`);
  
  // Icon mapping
  const IconComponent = 
      icon === 'Gavel' ? Gavel : 
      icon === 'Shield' ? Shield :
      icon === 'Map' ? Map : 
      Hash;

  return (
    <Link
      href={`/docs/${section.slug}`}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group font-medium text-sm ml-2 border-l border-white/5",
        isActive
          ? "bg-secondary text-foreground border-l-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5 hover:border-l-white/20"
      )}
    >
      <IconComponent className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
      {section.title}
      {isActive && <ChevronRight className="h-3 w-3 ml-auto text-primary animate-in fade-in slide-in-from-left-1" />}
    </Link>
  );
};

// Composant de Catégorie Dépliable
const SidebarCategory = ({ 
    title, 
    icon: Icon, 
    sections, 
    pathname, 
    iconKey,
    colorClass
}: { 
    title: string, 
    icon: any, 
    sections: Section[], 
    pathname: string | null, 
    iconKey: string,
    colorClass: string 
}) => {
    const [isOpen, setIsOpen] = useState(true);
    
    // Si la catégorie est vide, on l'affiche quand même ou pas ? 
    // Le design actuel les affiche. Gardons la logique précédente.
    const isEmpty = sections.length === 0;

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
            <CollapsibleContent className="space-y-0.5 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                {sections.map((section) => (
                    <SidebarLink key={section.id} section={section} pathname={pathname} icon={iconKey} />
                ))}
                {isEmpty && (
                    <p className="px-5 py-2 text-xs text-muted-foreground/50 italic">Aucune section.</p>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSections() {
      const supabase = createSupabaseClient();
      const { data } = await supabase
        .from("sections")
        .select("*")
        .order("order_index", { ascending: true });
      
      if (data) {
        setSections(data as Section[]);
      }
      setLoading(false);
    }

    fetchSections();
  }, []);

  return (
    <div className="flex flex-col h-full w-64 bg-sidebar/50 backdrop-blur-xl border-r border-sidebar-border shadow-2xl fixed left-0 top-0 z-40 hidden md:flex overflow-hidden">
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
      <ScrollArea className="flex-1 px-4 pb-4">
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
                pathname={pathname}
                iconKey="Gavel"
                colorClass="text-primary/80"
            />

            <SidebarCategory 
                title="Documents RP" 
                icon={Shield} 
                sections={sections.filter(s => s.category === 'rp')} 
                pathname={pathname}
                iconKey="Shield"
                colorClass="text-blue-400/80"
            />

            <SidebarCategory 
                title="Guides & Aide" 
                icon={Hash} 
                sections={sections.filter(s => s.category === 'guide')} 
                pathname={pathname}
                iconKey="Map"
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
