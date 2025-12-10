export type Section = {
    id: string;
    title: string;
    slug: string;
    category: 'reglement' | 'rp' | 'guide';
    order_index: number;
    icon?: string;
    created_at?: string;
};

export type Article = {
    id: string;
    section_id: string;
    title: string;
    slug: string;
    content: any; // JSON from Tiptap or HTML string
    is_published: boolean;
    order_index: number;
    created_at?: string;
    updated_at?: string;
};

export type NavigationItem = Section & {
    articles: Article[];
};
