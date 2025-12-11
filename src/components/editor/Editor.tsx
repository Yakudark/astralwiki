"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Button } from '@/components/ui/button';
import { 
  Bold, Italic, List, ListOrdered, Quote, Undo, Redo, 
  Heading2, Heading3, Link as LinkIcon, Image as ImageIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

type EditorProps = {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
};

export function Editor({ content, onChange, editable = true }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Image.configure({
         HTMLAttributes: {
            class: 'rounded-lg border border-white/10 my-4',
         }
      })
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] px-6 py-4 text-white',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable,
    immediatelyRender: false,
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input bg-background/50 rounded-lg overflow-hidden flex flex-col focus-within:ring-1 focus-within:ring-primary/50 transition-all">
      {/* Toolbar */}
      {editable && (
          <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/5 bg-white/[0.02]">
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive('bold')}
                icon={Bold}
                tooltip="Gras"
            />
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive('italic')}
                icon={Italic}
                tooltip="Italique"
            />
            <div className="w-px h-6 bg-white/10 mx-1" />
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor.isActive('heading', { level: 2 })}
                icon={Heading2}
                tooltip="Titre 2"
            />
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                active={editor.isActive('heading', { level: 3 })}
                icon={Heading3}
                tooltip="Titre 3"
            />
            <div className="w-px h-6 bg-white/10 mx-1" />
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive('bulletList')}
                icon={List}
                tooltip="Liste à puces"
            />
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive('orderedList')}
                icon={ListOrdered}
                tooltip="Liste numérotée"
            />
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={editor.isActive('blockquote')}
                icon={Quote}
                tooltip="Citation"
            />
            <div className="w-px h-6 bg-white/10 mx-1" />
            <ToolbarButton 
                onClick={setLink}
                active={editor.isActive('link')}
                icon={LinkIcon}
                tooltip="Lien"
            />
            
            <div className="ml-auto flex items-center gap-1">
                <ToolbarButton 
                    onClick={() => editor.chain().focus().undo().run()}
                    active={false}
                    icon={Undo}
                    tooltip="Annuler"
                    disabled={!editor.can().undo()}
                />
                <ToolbarButton 
                    onClick={() => editor.chain().focus().redo().run()}
                    active={false}
                    icon={Redo}
                    tooltip="Rétablir"
                    disabled={!editor.can().redo()}
                />
            </div>
          </div>
      )}
      
      {/* Content Area */}
      <EditorContent editor={editor} className="flex-1 bg-black/20" />
    </div>
  );
}

function ToolbarButton({ onClick, active, icon: Icon, tooltip, disabled }: any) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "h-8 w-8 p-0 text-muted-foreground hover:text-white hover:bg-white/10",
                active && "bg-primary/20 text-primary hover:bg-primary/30",
                disabled && "opacity-50 cursor-not-allowed"
            )}
            title={tooltip}
        >
            <Icon className="h-4 w-4" />
        </Button>
    )
}
