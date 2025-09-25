from paddleocr import PaddleOCR
import sys

def extract_menu_with_positions(image_path):
    """Extrait le texte avec positions depuis une image"""
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
                    if scores is None or scores[i] > 0.5:  # Seuil plus bas pour capturer plus
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

def format_generic_menu(text_elements):
    """Formate le menu de manière générique en détectant la structure"""

    formatted_lines = []
    formatted_lines.append("=" * 60)
    formatted_lines.append("MENU EXTRAIT PAR OCR")
    formatted_lines.append("=" * 60)
    formatted_lines.append("")

    # Grouper les éléments par ligne (Y similaire)
    lines = []
    current_line = []
    last_y = -1
    tolerance = 20  # Tolérance en pixels pour considérer sur la même ligne

    for elem in text_elements:
        if last_y == -1 or abs(elem['y'] - last_y) <= tolerance:
            current_line.append(elem)
        else:
            if current_line:
                lines.append(current_line)
            current_line = [elem]
        last_y = elem['y']

    if current_line:
        lines.append(current_line)

    # Traiter les lignes pour reconstituer les produits
    current_product = None
    products = []

    for line in lines:
        # Trier par X pour l'ordre horizontal
        line.sort(key=lambda e: e['x'])

        # Joindre les textes proches horizontalement
        grouped_texts = []
        current_group = []
        last_x_end = -1

        for elem in line:
            # Si l'élément est proche du précédent (moins de 100px), les grouper
            if last_x_end == -1 or elem['x'] - last_x_end < 100:
                current_group.append(elem['text'])
            else:
                if current_group:
                    grouped_texts.append(" ".join(current_group))
                current_group = [elem['text']]
            last_x_end = elem['x'] + elem.get('width', 50)

        if current_group:
            grouped_texts.append(" ".join(current_group))

        # Analyser la ligne
        line_text = " | ".join(grouped_texts)

        # Détecter les titres de sections
        if any(keyword in line_text.upper() for keyword in ["NOS ", "MENU", "SERVIS AVEC"]):
            if "SERVIS AVEC" in line_text.upper():
                formatted_lines.append(f"INFO: {line_text}")
            else:
                formatted_lines.append("")
                formatted_lines.append(f"=== {line_text.upper()} ===")
                formatted_lines.append("")

        # Détecter les noms de produits (commencent par L', LE, LA, ou sont en majuscules)
        elif (line_text.startswith("L'") or line_text.startswith("LE ") or
              line_text.startswith("LA ") or
              (len(grouped_texts) > 0 and grouped_texts[0].isupper() and
               len(grouped_texts[0]) > 3 and "€" not in grouped_texts[0])):

            # Sauvegarder le produit précédent
            if current_product:
                products.append(current_product)

            # Extraire le nom et les prix de la ligne
            product_name = ""
            prices = []

            for text in grouped_texts:
                if "€" in text or ("PLACE" in text.upper()) or ("LIVRAISON" in text.upper()):
                    prices.append(text)
                elif not product_name and not text.isdigit():
                    product_name = text
                elif product_name and "€" not in text:
                    product_name += " " + text

            current_product = {
                'name': product_name.strip(),
                'prices': prices,
                'description': []
            }

        # Ajouter les descriptions au produit courant
        elif current_product and not any(keyword in line_text.upper() for keyword in ["SUR PLACE", "LIVRAISON", "€"]):
            # C'est probablement une description
            current_product['description'].append(line_text)

        # Gérer les lignes de prix séparées
        elif current_product and ("€" in line_text or "PLACE" in line_text.upper() or "LIVRAISON" in line_text.upper()):
            for text in grouped_texts:
                if text not in current_product['prices']:
                    current_product['prices'].append(text)

    # Ajouter le dernier produit
    if current_product:
        products.append(current_product)

    # Afficher les produits formatés
    formatted_lines.append("PRODUITS DETECTES:")
    formatted_lines.append("-" * 40)

    for i, product in enumerate(products, 1):
        formatted_lines.append("")
        formatted_lines.append(f"{i}. {product['name']}")

        if product['description']:
            desc = " ".join(product['description'])
            # Nettoyer la description
            desc = desc.replace(" | ", ", ")
            formatted_lines.append(f"   Description: {desc}")

        if product['prices']:
            prix_text = " | ".join(product['prices'])
            formatted_lines.append(f"   Prix: {prix_text}")

    formatted_lines.append("")
    formatted_lines.append("=" * 60)

    return "\n".join(formatted_lines)

if __name__ == "__main__":
    # Permettre de passer une image en argument ou utiliser celle par défaut
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        print("Usage: python ocr_generic.py <chemin_vers_image>")
        print("Exemple: python ocr_generic.py C:\\chemin\\vers\\image.jpg")
        sys.exit(1)

    print(f"EXTRACTION EN COURS DE: {image_path}")
    text_elements = extract_menu_with_positions(image_path)

    print(f"NOMBRE D'ELEMENTS DETECTES: {len(text_elements)}")

    # Formater le menu générique
    formatted_menu = format_generic_menu(text_elements)

    print("\nRESULTAT:")
    print(formatted_menu)

    # Sauvegarder les résultats
    output_base = image_path.rsplit('.', 1)[0]  # Enlever l'extension

    # Version brute avec positions
    with open(f"{output_base}_ocr_brut.txt", 'w', encoding='utf-8') as f:
        f.write("TEXTE BRUT AVEC POSITIONS:\n")
        f.write("=" * 60 + "\n\n")
        for elem in text_elements:
            f.write(f"[X:{elem.get('x', 0):4} Y:{elem.get('y', 0):4} Score:{elem['score']:.2f}] {elem['text']}\n")

    with open(f"{output_base}_ocr_formate.txt", 'w', encoding='utf-8') as f:
        f.write(formatted_menu)

    print(f"\nResultats sauves dans:")
    print(f"  - {output_base}_ocr_brut.txt")
    print(f"  - {output_base}_ocr_formate.txt")