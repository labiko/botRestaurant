import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { BOT_WHATSAPP_NUMBER } from '@/constants/bot';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD || process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer les données de la vitrine
    const { data: vitrine, error } = await supabase
      .from('restaurant_vitrine_settings')
      .select(`
        *,
        restaurant:france_restaurants(
          name, phone, whatsapp_number,
          address, city, business_hours
        )
      `)
      .eq('slug', params.slug)
      .eq('is_active', true)
      .single();

    if (error || !vitrine) {
      return new NextResponse('Vitrine non trouvée', { status: 404 });
    }

    // Récupérer les produits populaires avec sélection intelligente
    const { data: popularProducts, error: productsError } = await supabase
      .from('france_products')
      .select(`
        name,
        price_on_site_base,
        product_type,
        category:france_menu_categories(name, icon, display_order)
      `)
      .eq('restaurant_id', vitrine.restaurant_id)
      .eq('is_active', true)
      .lt('price_on_site_base', 15) // Prix attractifs < 15€
      .in('product_type', ['simple', 'composite']) // Produits simples ou composites
      .order('display_order')
      .limit(15); // Récupérer plus pour faire une sélection

    // Produits par défaut en cas d'absence de données
    const defaultProducts = [
      {name: "Pizza Reine", price_on_site_base: 14, category: {icon: "🍕"}},
      {name: "Big Chef", price_on_site_base: 12, category: {icon: "🍔"}},
      {name: "Tacos Viandes", price_on_site_base: 11, category: {icon: "🌮"}},
      {name: "Buffalo", price_on_site_base: 9, category: {icon: "🥪"}},
      {name: "Carbonara", price_on_site_base: 8, category: {icon: "🍝"}}
    ];

    // Sélection intelligente des produits avec mix de catégories
    let productsToShow = defaultProducts;

    if (popularProducts && popularProducts.length > 0) {
      // Grouper par catégorie
      const productsByCategory = popularProducts.reduce((acc, product) => {
        const categoryName = product.category?.name || 'Autre';
        if (!acc[categoryName]) acc[categoryName] = [];
        acc[categoryName].push(product);
        return acc;
      }, {} as Record<string, typeof popularProducts>);

      // Sélectionner max 2 produits par catégorie pour diversifier
      const selectedProducts = [];
      for (const [categoryName, products] of Object.entries(productsByCategory)) {
        selectedProducts.push(...products.slice(0, 2));
        if (selectedProducts.length >= 10) break;
      }

      productsToShow = selectedProducts.slice(0, 10);
    }

    // Lire le template HTML
    const templatePath = path.join(process.cwd(), 'public', 'vitrine-template.html');
    let template = fs.readFileSync(templatePath, 'utf-8');

    // Parser les features
    const parseFeature = (featureJson: string) => {
      try {
        return JSON.parse(featureJson);
      } catch {
        return { emoji: '', text: '' };
      }
    };

    const feature1 = parseFeature(vitrine.feature_1);
    const feature2 = parseFeature(vitrine.feature_2);
    const feature3 = parseFeature(vitrine.feature_3);

    // Utiliser la constante globale pour le numéro du bot
    const restaurantPhone = vitrine.restaurant.phone;

    const formatBusinessHours = (businessHours: string | object) => {
      if (typeof businessHours === 'string') {
        return businessHours;
      }
      return 'Ouvert 7j/7 de 11h00 à 00h00';
    };

    // Remplacer les placeholders
    const replacements = {
      '{{RESTAURANT_NAME}}': vitrine.restaurant.name.toUpperCase(),
      '{{PRIMARY_COLOR}}': vitrine.primary_color,
      '{{SECONDARY_COLOR}}': vitrine.secondary_color,
      '{{ACCENT_COLOR}}': vitrine.accent_color,
      '{{LOGO_EMOJI}}': vitrine.logo_emoji,
      '{{SUBTITLE}}': vitrine.subtitle,
      '{{PROMO_TEXT}}': vitrine.promo_text || '',
      '{{PHONE}}': restaurantPhone,
      '{{WHATSAPP_NUMBER}}': BOT_WHATSAPP_NUMBER,
      '{{DELIVERY_TIME}}': vitrine.delivery_time_min.toString(),
      '{{RATING}}': vitrine.average_rating.toString(),
      '{{FEATURE1_EMOJI}}': feature1.emoji || '',
      '{{FEATURE1_TEXT}}': feature1.text || '',
      '{{FEATURE2_EMOJI}}': feature2.emoji || '',
      '{{FEATURE2_TEXT}}': feature2.text || '',
      '{{FEATURE3_EMOJI}}': feature3.emoji || '',
      '{{FEATURE3_TEXT}}': feature3.text || '',
      '{{ADDRESS}}': vitrine.restaurant.address,
      '{{CITY}}': vitrine.restaurant.city,
      '{{BUSINESS_HOURS}}': formatBusinessHours(vitrine.restaurant.business_hours),
      '{{MENU_CAROUSEL}}': duplicatedCarouselHTML,
    };

    // Générer le HTML du carousel avec les vrais produits
    const carouselHTML = productsToShow.map(product => `
                <div class="menu-item">
                    <div class="menu-item-emoji">${product.category?.icon || '🍽️'}</div>
                    <div class="menu-item-name">${product.name}</div>
                    <div class="menu-item-price">${product.price_on_site_base}€</div>
                </div>`).join('');

    // Dupliquer les éléments pour un carousel continu
    const duplicatedCarouselHTML = carouselHTML + carouselHTML;

    // Appliquer les remplacements
    for (const [placeholder, value] of Object.entries(replacements)) {
      template = template.replace(new RegExp(placeholder, 'g'), value);
    }

    // Retourner le HTML avec les bonnes headers
    return new NextResponse(template, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache 1 heure
      },
    });

  } catch (error) {
    console.error('Erreur génération vitrine:', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
}