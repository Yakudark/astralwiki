import { Suspense } from "react";
import ContentPageClient from "./ContentPageClient";

export const dynamic = "force-dynamic"; // admin => pas de statique

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-white">Chargement…</div>}>
      <ContentPageClient />
    </Suspense>
  );
}
