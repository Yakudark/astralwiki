"use client";

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
  import { arrayMove } from "@dnd-kit/sortable";
  import { TableBody, TableCell, TableRow } from "@/components/ui/table";
  import { Badge } from "@/components/ui/badge";
  import Link from "next/link";
  import { Button } from "@/components/ui/button";
  import { Edit, Trash2, FileText, ExternalLink } from "lucide-react";
  import { format } from "date-fns";
  import { fr } from "date-fns/locale";
  import { toast } from "react-hot-toast";
  import { DeleteArticleButton } from "./DeleteArticleButton";
  
  // Composant SortableItem pour les lignes du tableau
  function SortableItem({ article }: { article: any }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: article.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: 'grab',
      zIndex: 100, // Pour s'assurer que l'élément glissé est au-dessus des autres
    };
  
    return (
      <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners} className="hover:bg-white/5 border-white/5 data-[state=selected]:bg-muted">
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {article.title}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="text-sm">{(article.section as any)?.title || 'Sans section'}</span>
            <span className="text-xs text-muted-foreground capitalize">{(article.section as any)?.category}</span>
          </div>
        </TableCell>
        <TableCell>
          {article.is_published ? (
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Publié</Badge>
          ) : (
            <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">Brouillon</Badge>
          )}
        </TableCell>
        <TableCell className="text-muted-foreground whitespace-nowrap">
          { article.updated_at ? format(new Date(article.updated_at), "d MMM yyyy", { locale: fr }) : "-"}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            {/* Voir l'article (si publié) */}
            {article.is_published && (article.section as any) && (
              <Link href={`/docs/${(article.section as any).slug}/${article.slug}`} target="_blank">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            )}
  
            <Link href={`/admin/content/${article.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            
            <DeleteArticleButton articleId={article.id} />
          </div>
        </TableCell>
      </TableRow>
    );
  }
  
  interface SortableTableBodyProps {
    articles: any[];
    // handleDragEnd n'est plus passé ici
  }
  
  export function SortableTableBody({ articles }: SortableTableBodyProps) {
    return (
      <SortableContext 
        items={articles.map(article => article.id)}
        strategy={verticalListSortingStrategy}
      >
        {articles.map((article) => (
          <SortableItem key={article.id} article={article} />
        ))}
      </SortableContext>
    );
  }
