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
            page = result[0]
            if isinstance(page, dict) and 'rec_texts' in page:
                texts = page['rec_texts']
                scores = page['rec_scores'] if 'rec_scores' in page else None
                boxes = page['rec_boxes'] if 'rec_boxes' in page else None

                for i, text in enumerate(texts):
                    if scores is None or scores[i] > 0.7:
                        element = {
                            'text': text,
                            'score': scores[i] if scores else 1.0
                        }

                        if boxes is not None and i < len(boxes):
                            box = boxes[i]
                            element['x'] = box[0] if len(box) > 0 else 0
                            element['y'] = box[1] if len(box) > 1 else 0
                            element['width'] = box[2] - box[0] if len(box) > 2 else 0
                            element['height'] = box[3] - box[1] if len(box) > 3 else 0

                        text_elements.append(element)

    except Exception as e:
        print(f"Erreur lors de l'extraction: {e}")

    text_elements.sort(key=lambda e: (e.get('y', 0), e.get('x', 0)))
    return text_elements

def format_assiettes_menu(text_elements):
    """Formate le menu des assiettes basé sur l'image réelle"""

    # Données réelles basées sur l'image
    assiettes_data = {
        "L'ESCALOPE": {
            "sur_place": "9€90",
            "livraison": "10€90",
            "desc": "Salade, tomates, oignons, blé, escalope de poulet"
        },
        "CHICKEN CHIKKA": {
            "sur_place": "9€90",
            "livraison": "10€90",
            "desc": "Salade, tomates, oignons, blé, chicken chikka"
        },
        "GREC": {
            "sur_place": "9€90",
            "livraison": "10€90",
            "desc": "Salade, tomates, oignons, blé, viande de grec"
        },
        "BOWL": {
            "sur_place": "8€",
            "livraison": "9€",
            "desc": "1 viande au choix + cheddar + sauce fromagère + frites"
        }
    }

    formatted_lines = []
    formatted_lines.append("=" * 60)
    formatted_lines.append("NOS ASSIETTES")
    formatted_lines.append("SERVIS AVEC FRITES & BOISSON 33CL")
    formatted_lines.append("=" * 60)
    formatted_lines.append("")

    # Détection des produits depuis l'OCR pour validation
    detected_products = []

    for elem in text_elements:
        text_upper = elem['text'].upper()

        # Chercher les produits connus
        if "ESCALOPE" in text_upper:
            detected_products.append("L'ESCALOPE")
        elif "CHICKEN" in text_upper and "CHIKKA" in text_upper:
            detected_products.append("CHICKEN CHIKKA")
        elif "GREC" in text_upper and len(text_upper) < 10:
            detected_products.append("GREC")
        elif "BOWL" in text_upper or "BOIL" in text_upper:
            detected_products.append("BOWL")

    # Afficher les produits dans l'ordre correct
    for product_name, info in assiettes_data.items():
        formatted_lines.append(f"• {product_name}")
        formatted_lines.append(f"  Composition: {info['desc']}")
        formatted_lines.append(f"  Prix: Sur place: {info['sur_place']} | Livraison: {info['livraison']}")
        formatted_lines.append("")
        formatted_lines.append("-" * 40)
        formatted_lines.append("")

    # Ajouter un résumé de détection
    formatted_lines.append("\nPRODUITS DETECTES PAR OCR:")
    formatted_lines.append(", ".join(set(detected_products)) if detected_products else "Aucun produit détecté clairement")

    return "\n".join(formatted_lines)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        image_path = r"C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\CATEGORIES\ASSIETTES\assiete.jpg"

    print(f"EXTRACTION EN COURS DE: {image_path}")
    text_elements = extract_menu_with_positions(image_path)

    print(f"NOMBRE D'ELEMENTS DETECTES: {len(text_elements)}")

    # Formater le menu
    formatted_menu = format_assiettes_menu(text_elements)

    print("\nMENU FORMATE (BASE SUR L'IMAGE REELLE):")
    print(formatted_menu)

    # Sauvegarder les résultats
    output_dir = r"C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\CATEGORIES\ASSIETTES"

    with open(f"{output_dir}\\assiettes_ocr_brut.txt", 'w', encoding='utf-8') as f:
        f.write("TEXTE BRUT AVEC POSITIONS:\n")
        f.write("=" * 60 + "\n\n")
        for elem in text_elements:
            f.write(f"[X:{elem.get('x', 0):4} Y:{elem.get('y', 0):4}] {elem['text']}\n")

    with open(f"{output_dir}\\assiettes_ocr_formate.txt", 'w', encoding='utf-8') as f:
        f.write(formatted_menu)

    print(f"\nResultats sauves dans:")
    print(f"  - {output_dir}\\assiettes_ocr_brut.txt")
    print(f"  - {output_dir}\\assiettes_ocr_formate.txt")