// Service de clonage de templates de restaurant (Pizza Yolo 77 référence)
import { RestaurantTemplate, CategoryTemplateItem, RestaurantConfigTemplate } from '../interfaces/ocr-smart-configure.interface';

export class RestaurantTemplateClonerService {

  /**
   * Clone le template Pizza Yolo 77 avec ses 22 catégories
   */
  static async cloneRestaurantTemplate(sourceSlug: 'pizza-yolo-77'): Promise<RestaurantTemplate> {
    if (sourceSlug !== 'pizza-yolo-77') {
      throw new Error('Seul le template pizza-yolo-77 est supporté actuellement');
    }

    return {
      sourceSlug,
      sourceName: 'Pizza Yolo 77',
      categories: this.getPizzaYolo77Categories(),
      baseConfig: this.getPizzaYolo77Config()
    };
  }

  /**
   * Retourne les 22 catégories de Pizza Yolo 77
   */
  private static getPizzaYolo77Categories(): CategoryTemplateItem[] {
    return [
      { id: 1, name: 'TACOS', slug: 'tacos', icon: '🌮', display_order: 1 },
      { id: 2, name: 'BURGERS', slug: 'burgers', icon: '🍔', display_order: 3 },
      { id: 3, name: 'SANDWICHS', slug: 'sandwichs', icon: '🥪', display_order: 5 },
      { id: 4, name: 'GOURMETS', slug: 'gourmets', icon: '🥘', display_order: 6 },
      { id: 5, name: 'SMASHS', slug: 'smashs', icon: '🥩', display_order: 7 },
      { id: 6, name: 'ASSIETTES', slug: 'assiettes', icon: '🍽️', display_order: 8 },
      { id: 7, name: 'NAANS', slug: 'naans', icon: '🫓', display_order: 9 },
      { id: 8, name: 'POULET & SNACKS', slug: 'poulet-snacks', icon: '🍗', display_order: 10 },
      { id: 10, name: 'Pizzas', slug: 'pizzas', icon: '🍕', display_order: 2 },
      { id: 11, name: 'Menu Pizza', slug: 'menus', icon: '📋', display_order: 4 },
      { id: 12, name: 'ICE CREAM', slug: 'ice-cream', icon: '🍨', display_order: 11 },
      { id: 13, name: 'DESSERTS', slug: 'desserts', icon: '🧁', display_order: 12 },
      { id: 14, name: 'BOISSONS', slug: 'drinks', icon: '🥤', display_order: 13 },
      { id: 15, name: 'SALADES', slug: 'salades', icon: '🥗', display_order: 14 },
      { id: 16, name: 'TEX-MEX', slug: 'tex-mex', icon: '🌮', display_order: 15 },
      { id: 17, name: 'PANINI', slug: 'panini', icon: '🥪', display_order: 16 },
      { id: 18, name: 'PÂTES', slug: 'pates', icon: '🍝', display_order: 17 },
      { id: 19, name: 'MENU ENFANT', slug: 'menu-enfant', icon: '🍽️', display_order: 18 },
      { id: 21, name: 'BOWLS', slug: 'bowls', icon: '🍽️', display_order: 19 },
      { id: 22, name: 'CHICKEN BOX', slug: 'chicken-box', icon: '🍽️', display_order: 20 },
      { id: 26, name: 'MENU FAMILY', slug: 'menu-family', icon: '👨‍👩‍👧‍👦', display_order: 22 },
      { id: 38, name: 'MENU MIDI : PLAT + DESSERT + BOISSON', slug: 'menu-midi', icon: '🍽️', display_order: 5 }
    ];
  }

  /**
   * Configuration de base Pizza Yolo 77
   */
  private static getPizzaYolo77Config(): RestaurantConfigTemplate {
    return {
      delivery_zone_km: 5,
      min_order_amount: 0,
      delivery_fee: 2.50,
      business_hours: {
        "jeudi": { "isOpen": true, "closing": "23:00", "opening": "08:00" },
        "lundi": { "isOpen": true, "closing": "23:00", "opening": "09:00" },
        "mardi": { "isOpen": true, "closing": "04:00", "opening": "08:00" },
        "samedi": { "isOpen": true, "closing": "23:00", "opening": "10:00" },
        "dimanche": { "isOpen": true, "closing": "22:00", "opening": "08:00" },
        "mercredi": { "isOpen": true, "closing": "04:00", "opening": "08:00" },
        "vendredi": { "isOpen": true, "closing": "23:00", "opening": "07:00" }
      }
    };
  }

  /**
   * Génère un slug unique pour un nouveau restaurant
   */
  static generateUniqueSlug(restaurantName: string, existingSlugs: string[] = []): string {
    let baseSlug = restaurantName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    if (baseSlug.length > 50) {
      baseSlug = baseSlug.substring(0, 50).replace(/-[^-]*$/, '');
    }

    let slug = baseSlug;
    let counter = 1;

    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Valide les données du nouveau restaurant
   */
  static validateNewRestaurantData(data: {
    name: string;
    whatsapp_number: string;
    address?: string;
    city?: string;
    phone?: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push('Le nom du restaurant doit contenir au moins 2 caractères');
    }

    if (!data.whatsapp_number || !/^\d{10}$/.test(data.whatsapp_number.replace(/\s+/g, ''))) {
      errors.push('Le numéro WhatsApp doit contenir exactement 10 chiffres');
    }

    if (data.phone && !/^\d{10}$/.test(data.phone.replace(/\s+/g, ''))) {
      errors.push('Le numéro de téléphone doit contenir exactement 10 chiffres');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Prépare les catégories pour insertion en base
   */
  static prepareCategoriesForInsertion(categories: CategoryTemplateItem[], newRestaurantId: number) {
    return categories.map(category => ({
      restaurant_id: newRestaurantId,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      display_order: category.display_order,
      is_active: true
    }));
  }
}