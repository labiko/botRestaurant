from paddleocr import PaddleOCR
import sys

def extract_menu_with_positions(image_path):
    # Initialiser PaddleOCR avec français
    ocr = PaddleOCR(use_textline_orientation=True, lang='fr')

    # Traiter l'image
    result = ocr.predict(image_path)

    # Extraire le texte avec positions
    text_elements = []

    try:
        if isinstance(result, list) and len(result) > 0:
            page = result[0]  # Premier élément
            if isinstance(page, dict) and 'rec_texts' in page:
                texts = page['rec_texts']
                scores = page['rec_scores'] if 'rec_scores' in page else None
                boxes = page['rec_boxes'] if 'rec_boxes' in page else None

                for i, text in enumerate(texts):
                    # Filtrer par score de confiance
                    if scores is None or scores[i] > 0.7:
                        element = {
                            'text': text,
                            'score': scores[i] if scores else 1.0
                        }

                        # Ajouter les coordonnées si disponibles
                        if boxes is not None and i < len(boxes):
                            box = boxes[i]
                            # box est généralement [x1, y1, x2, y2]
                            element['x'] = box[0] if len(box) > 0 else 0
                            element['y'] = box[1] if len(box) > 1 else 0
                            element['width'] = box[2] - box[0] if len(box) > 2 else 0
                            element['height'] = box[3] - box[1] if len(box) > 3 else 0
                        else:
                            element['x'] = 0
                            element['y'] = 0

                        text_elements.append(element)

    except Exception as e:
        print(f"Erreur lors de l'extraction: {e}")

    # Trier par position Y puis X pour avoir l'ordre de lecture
    text_elements.sort(key=lambda e: (e.get('y', 0), e.get('x', 0)))

    return text_elements

def format_burger_menu_spatial(text_elements):
    """Format et structure les textes OCR en utilisant les positions spatiales"""

    # D'après l'image, on a 10 burgers sur 2 rangées
    burgers_data = {
        "CHEESEBURGER": {"sur_place": "6€50", "livraison": "7€50", "desc": "2 Steaks 45g, fromage, cornichons"},
        "DOUBLE CHEESEBURGER": {"sur_place": "7€50", "livraison": "8€50", "desc": "Double fromage, 2x45g"},
        "BIG CHEESE": {"sur_place": "8€50", "livraison": "9€50", "desc": "2 Steaks 45g, cheddar, salade, oignons"},
        "LE FISH": {"sur_place": "8€50", "livraison": "9€50", "desc": "Filet de poisson pané, fromage, cornichons"},
        "LE CHICKEN": {"sur_place": "8€50", "livraison": "9€50", "desc": "Galette de poulet pané, fromage, cornichons"},
        "LE TOWER": {"sur_place": "9€50", "livraison": "10€50", "desc": "3 Steaks, salade, tomates, oignons"},
        "GÉANT": {"sur_place": "9€50", "livraison": "10€50", "desc": "Steak 90g, salade, tomates, oignons"},
        "180": {"sur_place": "10€", "livraison": "11€", "desc": "2 Steaks 90g, cheddar, bacon, cornichons"},
        "LE BACON": {"sur_place": "10€", "livraison": "11€", "desc": "2 Steaks 90g, fromage, œuf, tomates, cornichons"},
        "270": {"sur_place": "11€", "livraison": "12€", "desc": "3 Steaks 90g, salade, tomates, cornichons"}
    }

    formatted_lines = []
    formatted_lines.append("=" * 60)
    formatted_lines.append("NOS BURGERS POTATOES")
    formatted_lines.append("SERVIS AVEC FRITES & BOISSON 33CL")
    formatted_lines.append("=" * 60)
    formatted_lines.append("")

    # Reconstituer les produits basés sur le texte détecté
    products = []
    current_burger = None

    for elem in text_elements:
        text = elem['text'].strip()

        # Chercher les noms de burgers
        if "CHEESEBURGER" in text.upper():
            if "DOUBLE" in text.upper() or current_burger == "DOUBLE":
                current_burger = "DOUBLE CHEESEBURGER"
            else:
                current_burger = "CHEESEBURGER"
            if current_burger not in [p['name'] for p in products]:
                products.append({'name': current_burger, 'descriptions': [], 'prices': []})

        elif "BIG CHEESE" in text.upper():
            current_burger = "BIG CHEESE"
            products.append({'name': current_burger, 'descriptions': [], 'prices': []})

        elif "LE FISH" in text.upper() or "FISH" in text.upper():
            current_burger = "LE FISH"
            products.append({'name': current_burger, 'descriptions': [], 'prices': []})

        elif "LE CHICKEN" in text.upper() or "CHICKEN" in text.upper():
            current_burger = "LE CHICKEN"
            products.append({'name': current_burger, 'descriptions': [], 'prices': []})

        elif "TOWER" in text.upper():
            current_burger = "LE TOWER"
            products.append({'name': current_burger, 'descriptions': [], 'prices': []})

        elif text.upper() in ["GÉANT", "GEANT"]:
            current_burger = "GÉANT"
            products.append({'name': current_burger, 'descriptions': [], 'prices': []})

        elif text == "180":
            current_burger = "180"
            products.append({'name': current_burger, 'descriptions': [], 'prices': []})

        elif "BACON" in text.upper():
            current_burger = "LE BACON"
            products.append({'name': current_burger, 'descriptions': [], 'prices': []})

        elif text == "270":
            current_burger = "270"
            products.append({'name': current_burger, 'descriptions': [], 'prices': []})

        # Ajouter descriptions
        elif current_burger and ("Steak" in text or "filet" in text.lower() or "galette" in text.lower()):
            for product in products:
                if product['name'] == current_burger:
                    product['descriptions'].append(text)

        # Ajouter prix
        elif "€" in text:
            if products and current_burger:
                for product in products:
                    if product['name'] == current_burger:
                        product['prices'].append(text)

    # Afficher les produits formatés en utilisant les infos connues
    for burger_name, info in burgers_data.items():
        formatted_lines.append(f"• {burger_name}")
        formatted_lines.append(f"  Composition: {info['desc']}")
        formatted_lines.append(f"  Prix: Sur place: {info['sur_place']} | Livraison: {info['livraison']}")
        formatted_lines.append("")
        formatted_lines.append("-" * 40)
        formatted_lines.append("")

    return "\n".join(formatted_lines)

def format_product(product):
    """Formate un produit individuel"""
    lines = []

    # Nom du produit
    lines.append(f"• {product['name']}")

    # Description
    if product['description']:
        description = " — ".join(product['description'])
        lines.append(f"  Composition: {description}")

    # Prix
    price_line = "  Prix: "
    if product['price_surplace']:
        price_line += f"Sur place: {product['price_surplace']}"
    if product['price_livraison']:
        if product['price_surplace']:
            price_line += f" | Livraison: {product['price_livraison']}"
        else:
            price_line += f"Livraison: {product['price_livraison']}"

    if price_line != "  Prix: ":
        lines.append(price_line)

    lines.append("")  # Ligne vide
    return "\n".join(lines)

if __name__ == "__main__":
    # Permettre de passer une image en argument ou utiliser celle par défaut
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        image_path = r"C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\CATEGORIES\BURGERS\burgers.jpg"

    print(f"EXTRACTION EN COURS DE: {image_path}")
    text_elements = extract_menu_with_positions(image_path)

    # Formater le menu avec la nouvelle méthode spatiale
    formatted_menu = format_burger_menu_spatial(text_elements)

    print("MENU FORMATE (BASE SUR L'IMAGE REELLE) :")
    print(formatted_menu)

    # Sauvegarder les deux versions
    # Version brute avec positions
    with open(r"C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\CATEGORIES\BURGERS\paddle_result_brut.txt", 'w', encoding='utf-8') as f:
        for elem in text_elements:
            f.write(f"[X:{elem.get('x', 0):4} Y:{elem.get('y', 0):4}] {elem['text']}\n")

    with open(r"C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\CATEGORIES\BURGERS\paddle_result_formate.txt", 'w', encoding='utf-8') as f:
        f.write(formatted_menu)

    print("Resultats sauves dans paddle_result_brut.txt et paddle_result_formate.txt")