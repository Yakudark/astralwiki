"use client";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, ExternalLink, FileText, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DeleteArticleButton } from "./DeleteArticleButton";

type Section = {
  id: string;
  title: string;
  category: string | null;
  slug: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  updated_at: string;
  order_index: number | null;
  section: Section | null;
};

function SortableItem({ article }: { article: Article }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: article.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "default",
    zIndex: 100,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="hover:bg-white/5 border-white/5 data-[state=selected]:bg-muted"
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {/* ✅ Poignée = seul endroit draggable */}
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-white hover:bg-white/10"
            aria-label="Réorganiser"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{article.title}</span>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm">
            {article.section?.title ?? "Sans section"}
          </span>
          {article.section?.category ? (
            <span className="text-xs text-muted-foreground capitalize">
              {article.section.category}
            </span>
          ) : null}
        </div>
      </TableCell>

      <TableCell>
        {article.is_published ? (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
            Publié
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-yellow-500 border-yellow-500/30"
          >
            Brouillon
          </Badge>
        )}
      </TableCell>

      <TableCell className="text-muted-foreground whitespace-nowrap">
        {article.updated_at
          ? format(new Date(article.updated_at), "d MMM yyyy", { locale: fr })
          : "-"}
      </TableCell>

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          {article.is_published && article.section?.slug ? (
            <Link
              href={`/docs/${article.section.slug}/${article.slug}`}
              target="_blank"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-white"
                onPointerDown={(e) => e.stopPropagation()} // ✅ sécurité
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          ) : null}

          <Link href={`/admin/content/${article.id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
              onPointerDown={(e) => e.stopPropagation()} // ✅ sécurité
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Link>

          {/* ✅ sécurité aussi */}
          <div onPointerDown={(e) => e.stopPropagation()}>
            <DeleteArticleButton articleId={article.id} />
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function SortableTableBody({ articles }: { articles: Article[] }) {
  return (
    <SortableContext
      items={articles.map((a) => a.id)}
      strategy={verticalListSortingStrategy}
    >
      {articles.map((article) => (
        <SortableItem key={article.id} article={article} />
      ))}
    </SortableContext>
  );
}
