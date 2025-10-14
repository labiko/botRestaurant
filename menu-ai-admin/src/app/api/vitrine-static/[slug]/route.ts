import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { BOT_WHATSAPP_NUMBER } from '@/constants/bot';
import { getSupabaseClientForRequest } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = getSupabaseClientForRequest(request);
    const { slug } = await params;

    // Récupérer les données de la vitrine sans jointure
    const { data: vitrine, error } = await supabase
      .from('restaurant_vitrine_settings')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !vitrine) {
      return new NextResponse('Vitrine non trouvée', { status: 404 });
    }

    // Récupérer les infos du restaurant séparément
    const { data: restaurant, error: restaurantError } = await supabase
      .from('france_restaurants')
      .select('name, phone, whatsapp_number, address, city, business_hours')
      .eq('id', vitrine.restaurant_id)
      .single();

    if (restaurantError || !restaurant) {
      return new NextResponse('Restaurant non trouvé', { status: 404 });
    }

    // Combiner les données
    const vitrineWithRestaurant = {
      ...vitrine,
      france_restaurants: restaurant
    };

    // Récupérer les produits populaires avec sélection intelligente
    const { data: popularProducts, error: productsError } = await supabase
      .from('france_products')
      .select(`
        name,
        price_on_site_base,
        category:france_menu_categories(name, icon)
      `)
      .eq('restaurant_id', vitrineWithRestaurant.restaurant_id)
      .eq('is_active', true)
      .not('price_on_site_base', 'is', null) // Exclure les prix null
      .order('display_order')
      .limit(15); // Récupérer plus pour faire une sélection

    console.log('Products query result:', { popularProducts, productsError });

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
      try {
        // Grouper par catégorie de façon sécurisée
        const productsByCategory = popularProducts.reduce((acc, product) => {
          if (!product || typeof product !== 'object') return acc;

          const categoryName = product.category?.name || 'Autre';
          if (!acc[categoryName]) acc[categoryName] = [];
          acc[categoryName].push(product);
          return acc;
        }, {} as Record<string, any[]>);

        // Sélectionner max 2 produits par catégorie pour diversifier
        const selectedProducts = [];
        for (const [categoryName, products] of Object.entries(productsByCategory)) {
          if (Array.isArray(products)) {
            selectedProducts.push(...products.slice(0, 2));
            if (selectedProducts.length >= 10) break;
          }
        }

        productsToShow = selectedProducts.length > 0 ? selectedProducts.slice(0, 10) : defaultProducts;
        console.log('Final products to show:', productsToShow);
      } catch (selectionError) {
        console.error('Error in product selection:', selectionError);
        productsToShow = defaultProducts;
      }
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

    const feature1 = parseFeature(vitrineWithRestaurant.feature_1);
    const feature2 = parseFeature(vitrineWithRestaurant.feature_2);
    const feature3 = parseFeature(vitrineWithRestaurant.feature_3);

    // Utiliser la constante globale pour le numéro du bot
    const restaurantPhone = vitrineWithRestaurant.france_restaurants.phone;

    const formatBusinessHours = (businessHours: string | object) => {
      if (typeof businessHours === 'string') {
        return businessHours;
      }
      return 'Ouvert 7j/7 de 11h00 à 00h00';
    };

    // Générer le HTML du carousel avec les vrais produits
    let carouselHTML = '';
    try {
      carouselHTML = productsToShow.map(product => {
        const productName = product.name || 'Produit';
        const productPrice = product.price_on_site_base || 0;
        const productIcon = product.category?.icon || '🍽️';

        // N'afficher le prix que s'il est > 0
        const priceHTML = productPrice > 0
          ? `<div class="menu-item-price">${productPrice}€</div>`
          : '';

        return `
                <div class="menu-item">
                    <div class="menu-item-emoji">${productIcon}</div>
                    <div class="menu-item-name">${productName}</div>
                    ${priceHTML}
                </div>`;
      }).join('');
    } catch (htmlError) {
      console.error('Error generating carousel HTML:', htmlError);
      // Fallback HTML
      carouselHTML = `
                <div class="menu-item">
                    <div class="menu-item-emoji">🍕</div>
                    <div class="menu-item-name">Pizza Reine</div>
                    <div class="menu-item-price">14€</div>
                </div>
                <div class="menu-item">
                    <div class="menu-item-emoji">🍔</div>
                    <div class="menu-item-name">Big Chef</div>
                    <div class="menu-item-price">12€</div>
                </div>`;
    }

    // Dupliquer les éléments pour un carousel continu
    const duplicatedCarouselHTML = carouselHTML + carouselHTML;

    // Remplacer les placeholders
    const replacements = {
      '{{RESTAURANT_NAME}}': vitrineWithRestaurant.france_restaurants.name.toUpperCase(),
      '{{PRIMARY_COLOR}}': vitrineWithRestaurant.primary_color,
      '{{SECONDARY_COLOR}}': vitrineWithRestaurant.secondary_color,
      '{{ACCENT_COLOR}}': vitrineWithRestaurant.accent_color,
      '{{LOGO_EMOJI}}': vitrineWithRestaurant.logo_emoji,
      '{{SUBTITLE}}': vitrineWithRestaurant.subtitle,
      '{{PROMO_TEXT}}': vitrineWithRestaurant.promo_text || '',
      '{{PHONE}}': restaurantPhone,
      '{{WHATSAPP_NUMBER}}': BOT_WHATSAPP_NUMBER,
      '{{DELIVERY_TIME}}': vitrineWithRestaurant.delivery_time_min.toString(),
      '{{RATING}}': vitrineWithRestaurant.average_rating.toString(),
      '{{FEATURE1_EMOJI}}': feature1.emoji || '',
      '{{FEATURE1_TEXT}}': feature1.text || '',
      '{{FEATURE2_EMOJI}}': feature2.emoji || '',
      '{{FEATURE2_TEXT}}': feature2.text || '',
      '{{FEATURE3_EMOJI}}': feature3.emoji || '',
      '{{FEATURE3_TEXT}}': feature3.text || '',
      '{{ADDRESS}}': vitrineWithRestaurant.france_restaurants.address,
      '{{CITY}}': vitrineWithRestaurant.france_restaurants.city,
      '{{BUSINESS_HOURS}}': formatBusinessHours(vitrineWithRestaurant.france_restaurants.business_hours),
      '{{MENU_CAROUSEL}}': duplicatedCarouselHTML,
    };

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