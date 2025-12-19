import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import { Search } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface Article {
  id: string;
  title: string;
  slug: string;
  section: { slug: string }[]; // ✅ tableau
}

export function CommandMenu({
  open,
  setOpen,
  onArticleSelected,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>; // ✅ type React
  onArticleSelected?: (sectionSlug: string, articleSlug: string) => void;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const supabase = supabaseBrowser;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev); // ✅ toggle safe
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      return;
    }

    async function fetchArticles() {
      setLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, section(slug)")
        .order("title", { ascending: true });

      if (error) {
        console.error(
          "Erreur lors du chargement des articles pour la recherche:",
          error.message
        );
      } else {
        setArticles((data ?? []) as Article[]);
      }
      setLoading(false);
    }

    fetchArticles();
  }, [open, supabase]);

  const normalizeString = (str: string) =>
    str
      .normalize("NFD")
      .replace(/\u0300-\u036f/g, "")
      .toLowerCase();

  const filteredArticles = articles.filter((article) =>
    normalizeString(article.title).includes(normalizeString(searchQuery))
  );

  const handleSelect = (slug: string, sectionSlug: string) => {
    setOpen(false);
    router.push(`/docs/${sectionSlug}/${slug}`);
    onArticleSelected?.(sectionSlug, slug);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 shadow-lg">
        <Command shouldFilter={false}>
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
            <CommandInput
              placeholder="Rechercher un article, une règle..."
              className="pl-10 pr-4 border-none focus:ring-0 outline-none placeholder:text-muted-foreground"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
          </div>

          <CommandList className="h-[var(--cmdk-list-height)] max-h-[400px] overflow-auto px-2">
            {loading && <CommandEmpty>Chargement des articles...</CommandEmpty>}

            {!loading &&
              filteredArticles.length === 0 &&
              searchQuery === "" && (
                <CommandEmpty>
                  Commencez à taper pour rechercher des articles.
                </CommandEmpty>
              )}

            {!loading &&
              filteredArticles.length === 0 &&
              searchQuery !== "" && (
                <CommandEmpty>
                  Aucun article trouvé pour &quot;{searchQuery}&quot;.
                </CommandEmpty>
              )}

            <CommandGroup heading="Articles">
              {filteredArticles.map((article) => {
                const sectionSlug = article.section?.[0]?.slug ?? "docs";
                return (
                  <CommandItem
                    key={article.id}
                    value={article.title}
                    onSelect={() => handleSelect(article.slug, sectionSlug)}
                    className="flex items-center justify-between"
                  >
                    <span>{article.title}</span>
                    <span className="text-muted-foreground text-xs">
                      {sectionSlug}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
