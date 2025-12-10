type Props = {
  params: {
    sectionSlug: string;
    articleSlug: string;
  };
};

export default function ArticlePage({ params }: Props) {
  return (
    <div className="text-white p-8">
      <h1 className="text-2xl font-bold mb-2">
        Placeholder article : {params.articleSlug}
      </h1>
      <p className="text-sm text-slate-400">
        Cette page sera branchée sur Supabase plus tard.
      </p>
    </div>
  );
}
