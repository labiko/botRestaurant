// /api/ocr/get-pizza-yolo-template
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Récupérer les données de Pizza Yolo 77 pour pré-remplir le formulaire
    const { data: restaurant, error } = await supabase
      .from('france_restaurants')
      .select('name, whatsapp_number, address, city, phone')
      .eq('slug', 'pizza-yolo-77')
      .single();

    if (error) {
      console.error('Erreur récupération Pizza Yolo 77:', error);
      // Fallback avec données par défaut si erreur
      return Response.json({
        success: true,
        data: {
          name: 'Pizza Yolo 77',
          whatsapp_number: '0164880605',
          address: '251 Av. Philippe Bur, 77550 Moissy-Cramayel',
          city: 'Paris',
          phone: '0164880605'
        }
      });
    }

    return Response.json({
      success: true,
      data: restaurant
    });

  } catch (error) {
    console.error('Erreur API get-pizza-yolo-template:', error);
    return Response.json({
      success: false,
      error: 'Erreur lors de la récupération des données template'
    }, { status: 500 });
  }
}