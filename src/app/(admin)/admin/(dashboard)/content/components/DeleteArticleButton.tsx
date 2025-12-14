"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase-browser"; // AJOUT

export function DeleteArticleButton({
  articleId,
  onArticleDeletedLocally, // AJOUT
}: {
  articleId: string;
  onArticleDeletedLocally?: (deletedArticleId: string) => void; // AJOUT
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (
      !confirm(
        "Êtes-vous absolument sûr de vouloir supprimer cet article ? Cette action est irréversible."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabaseBrowser
        .from("articles")
        .delete()
        .eq("id", articleId);

      if (error) {
        throw new Error(
          error.message || "Erreur lors de la suppression de l'article."
        );
      }

      toast.success("Article supprimé avec succès !");
      router.refresh();
      if (onArticleDeletedLocally) {
        onArticleDeletedLocally(articleId); // Appel du callback
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "La suppression a échoué.");
      } else {
        toast.error("La suppression a échoué.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
      onClick={(e) => {
        e.stopPropagation();
        handleDelete();
      }}
      disabled={loading}
      aria-label="Supprimer l'article"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
