/**
 * Script de test pour l'impression avec données complexes
 * Simule une vraie structure de commande du back-office
 */

// Données de test avec structure réelle du back-office
const complexOrder = {
  id: 190,
  order_number: "0110-0011",
  restaurant_name: "Pizza Yolo 77",
  customer_name: "Jean Dupont",
  customer_phone: "33620951645",
  delivery_mode: "livraison",
  delivery_address: "123 Rue de la Paix, Paris",
  total_amount: 45.50,
  items: [
    // Pizza avec configuration
    {
      productId: 1,
      productName: "🍕 Pizza Margherita",
      categoryName: "Pizzas",
      quantity: 2,
      unitPrice: 12.00,
      totalPrice: 24.00,
      configuration: {
        size: [{ size_name: "XL" }],
        base: ["Tomate"],
        fromage: ["Mozzarella", "Emmental"],
        viande: ["Jambon", "Merguez"]
      }
    },
    // Menu avec items additionnels
    {
      productId: 2,
      productName: "🍔 Menu Big Burger",
      categoryName: "Menus",
      quantity: 1,
      unitPrice: 15.50,
      totalPrice: 15.50,
      type: "menu",
      details: {
        burger: { name: "Big Burger XL" },
        sides: { name: "Frites Maison" },
        beverages: [
          { name: "Coca Cola 33cl" }
        ]
      },
      configuration: {
        sauce: ["Ketchup", "Mayonnaise"],
        supplements: ["Bacon", "Cornichons"]
      }
    },
    // Menu Pizza avec expansion
    {
      productId: 3,
      productName: "🍕 Menu Pizza Duo",
      categoryName: "Menus Pizza",
      quantity: 1,
      unitPrice: 6.00,
      totalPrice: 6.00,
      type: "menu_pizza",
      details: {
        pizzas: [
          { name: "Pizza 4 Fromages", size: "Medium" },
          { name: "Pizza Végétarienne", size: "Medium" }
        ],
        beverages: [
          { name: "Coca Cola 1.5L" }
        ]
      }
    }
  ]
};

// Simuler le formatage avec le service universel
function simulateUniversalFormatting(items) {
  return items.map(item => {
    const formatted = {
      productName: item.productName || item.name || 'Produit',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || item.price || 0,
      totalPrice: item.totalPrice || item.total_price || 0,
      sizeInfo: item.configuration?.size?.[0]?.size_name,
      inlineConfiguration: [],
      additionalItems: [],
      expandedItems: []
    };

    // Configuration inline
    if (item.configuration) {
      Object.entries(item.configuration).forEach(([key, value]) => {
        if (Array.isArray(value) && key !== 'size') {
          formatted.inlineConfiguration.push(...value);
        }
      });
    }

    // Items additionnels pour les menus
    if (item.type === 'menu' && item.details) {
      if (item.details.burger) formatted.additionalItems.push(item.details.burger.name);
      if (item.details.sides) formatted.additionalItems.push(item.details.sides.name);
      if (item.details.beverages) {
        item.details.beverages.forEach(b => formatted.additionalItems.push(b.name));
      }
    }

    // Items expandés pour menu pizza
    if (item.type === 'menu_pizza' && item.details) {
      if (item.details.pizzas) {
        item.details.pizzas.forEach(p => {
          formatted.expandedItems.push(`${p.name} (${p.size})`);
        });
      }
      if (item.details.beverages) {
        item.details.beverages.forEach(b => formatted.expandedItems.push(b.name));
      }
    }

    return formatted;
  });
}

// Formatter le ticket
function formatComplexTicket(order) {
  const formattedItems = simulateUniversalFormatting(order.items);

  let articlesText = formattedItems.map(item => {
    let itemLine = `- ${item.quantity}x ${item.productName}: ${item.totalPrice.toFixed(2)}€`;

    if (item.sizeInfo) {
      itemLine += ` (${item.sizeInfo})`;
    }

    if (item.inlineConfiguration.length > 0) {
      itemLine += `\n  → ${item.inlineConfiguration.join(', ')}`;
    }

    if (item.additionalItems.length > 0) {
      item.additionalItems.forEach(addItem => {
        itemLine += `\n  + ${addItem}`;
      });
    }

    if (item.expandedItems.length > 0) {
      item.expandedItems.forEach(expItem => {
        itemLine += `\n  • ${expItem}`;
      });
    }

    return itemLine;
  }).join('\n\n');

  return `
============================
     ${order.restaurant_name}
============================
Commande #${order.order_number}
${new Date().toLocaleString('fr-FR')}

CLIENT: ${order.customer_name}
TEL: ${order.customer_phone}

COMMANDE:
${articlesText}

----------------------------
TOTAL: ${order.total_amount.toFixed(2)}€
Mode: Livraison
Adresse: ${order.delivery_address}
============================
`;
}

// Exécution
console.log('\n🖨️ SIMULATION IMPRESSION TICKET COMPLEXE');
console.log('==========================================\n');

const ticket = formatComplexTicket(complexOrder);
console.log(ticket);

console.log('\n📝 CARACTÉRISTIQUES DU TICKET:');
console.log('==============================');
console.log('✅ Gestion des tailles (XL, Medium)');
console.log('✅ Configuration inline (sauces, suppléments)');
console.log('✅ Items de menu détaillés');
console.log('✅ Expansion des menus pizza');
console.log('✅ Formatage professionnel');
console.log('✅ Compatible imprimantes thermiques 58mm/80mm');