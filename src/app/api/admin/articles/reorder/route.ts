import { createSupabaseAdminClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const reorderData = await request.json(); // Attendre que la promesse de request.json() soit résolue

    if (!Array.isArray(reorderData)) {
      return NextResponse.json({ error: "Format de données invalide. Attendu un tableau." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    
    const updatePromises = reorderData.map(async (item: { id: string; order_index: number }) => {
      const { error: updateError } = await supabase
        .from("articles")
        .update({ order_index: item.order_index })
        .eq("id", item.id);

      if (updateError) {
        throw updateError; // Lancer l'erreur pour qu'elle soit capturée par le bloc try/catch principal
      }
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ message: "Ordre des articles mis à jour avec succès." }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur inattendue lors de la réorganisation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
