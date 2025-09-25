import base64
import json
import sys
import os
from openai import OpenAI
from pathlib import Path

# Configuration - À modifier avec votre clé API
# Vous pouvez la mettre dans une variable d'environnement OPENAI_API_KEY
# ou la définir directement ici (pas recommandé pour la production)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-openai-api-key-here")

def encode_image(image_path):
    """Encode l'image en base64"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def extract_menu_with_openai(image_path):
    """Extrait le menu en utilisant l'API OpenAI Vision"""

    # Initialiser le client OpenAI
    client = OpenAI(api_key=OPENAI_API_KEY)

    # Encoder l'image
    base64_image = encode_image(image_path)

    # Prompt optimisé pour extraction structurée
    prompt = """
    Analyse cette image de menu restaurant avec GRANDE ATTENTION et extrais TOUTES les informations.

    INSTRUCTIONS CRITIQUES:
    1. COMPTE d'abord le nombre EXACT de produits visibles sur l'image
    2. Extrais TOUS les produits - vérifie 2 FOIS pour n'en manquer AUCUN
    3. Pour les prix, regarde ATTENTIVEMENT:
       - Prix SUR PLACE (généralement à gauche ou en haut)
       - Prix LIVRAISON (généralement à droite ou en bas)
       - Les prix livraison sont souvent = prix sur place + 1€
    4. Si l'image a plusieurs colonnes ou rangées, traite CHAQUE colonne/rangée
    5. Inclus TOUS les produits même ceux avec des noms courts comme "180", "270", etc.
    6. Pour chaque produit, extrais:
       - Le nom EXACT (même si c'est juste un nombre)
       - TOUS les ingrédients/composition
       - Les deux prix (sur place ET livraison)

    VERIFICATION IMPORTANTE:
    - Si tu vois 10 produits, tu dois retourner 10 produits dans le JSON
    - Si tu vois des produits sur 2 rangées, vérifie CHAQUE rangée
    - N'oublie PAS les produits aux extrémités ou coins de l'image

    Format JSON requis:
    {
      "menu_title": "titre exact du menu",
      "menu_info": "informations sur le service (ex: servis avec frites & boisson)",
      "total_products_detected": nombre_total_de_produits_vus,
      "products": [
        {
          "name": "nom exact du produit",
          "description": "description complète avec tous les ingrédients",
          "price_onsite": nombre_exact_en_euros,
          "price_delivery": nombre_exact_en_euros,
          "currency": "€",
          "position": "rangée_1" ou "rangée_2" si applicable
        }
      ]
    }

    DOUBLE VERIFICATION:
    Avant de finaliser, recompte les produits et assure-toi que le nombre dans "total_products_detected"
    correspond exactement au nombre d'éléments dans le tableau "products".

    Retourne UNIQUEMENT le JSON, sans aucun texte avant ou après.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # Utiliser gpt-4o pour plus de précision
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                                "detail": "high"  # Maximum de précision pour détecter tous les détails
                            }
                        }
                    ]
                }
            ],
            max_tokens=3000,  # Augmenté pour permettre plus de produits
            temperature=0  # Zéro pour maximum de consistance
        )

        # Extraire la réponse
        content = response.choices[0].message.content.strip()

        # Nettoyer la réponse si elle contient du texte avant/après le JSON
        if content.startswith("```json"):
            content = content[7:]  # Enlever ```json
        if content.endswith("```"):
            content = content[:-3]  # Enlever ```

        # Parser le JSON
        menu_data = json.loads(content)

        return menu_data

    except json.JSONDecodeError as e:
        print(f"Erreur de parsing JSON: {e}")
        print(f"Contenu reçu: {content}")
        return None
    except Exception as e:
        print(f"Erreur API OpenAI: {e}")
        return None

def format_menu_output(menu_data):
    """Formate le menu extrait pour l'affichage"""

    if not menu_data:
        return "Erreur lors de l'extraction"

    lines = []
    lines.append("=" * 60)

    # Titre du menu
    if menu_data.get("menu_title"):
        lines.append(menu_data["menu_title"].upper())
        lines.append("=" * 60)

    # Infos générales
    if menu_data.get("menu_info"):
        lines.append(menu_data["menu_info"])
        lines.append("")

    # Produits
    lines.append("PRODUITS EXTRAITS:")
    lines.append("-" * 40)

    for i, product in enumerate(menu_data.get("products", []), 1):
        lines.append("")
        lines.append(f"{i}. {product.get('name', 'Sans nom')}")

        if product.get('description'):
            lines.append(f"   Description: {product['description']}")

        # Prix
        price_parts = []
        if product.get('price_onsite') is not None:
            price_parts.append(f"Sur place: {product['price_onsite']}{product.get('currency', '€')}")
        if product.get('price_delivery') is not None:
            price_parts.append(f"Livraison: {product['price_delivery']}{product.get('currency', '€')}")

        if price_parts:
            lines.append(f"   Prix: {' | '.join(price_parts)}")

    lines.append("")
    lines.append("=" * 60)

    return "\n".join(lines)

def save_results(image_path, menu_data, formatted_output):
    """Sauvegarde les résultats dans des fichiers"""

    base_path = Path(image_path).parent
    base_name = Path(image_path).stem

    # Sauvegarder le JSON brut
    json_path = base_path / f"{base_name}_openai.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(menu_data, f, ensure_ascii=False, indent=2)

    # Sauvegarder le format texte
    txt_path = base_path / f"{base_name}_openai.txt"
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(formatted_output)

    return json_path, txt_path

def main():
    # Vérifier la clé API
    if OPENAI_API_KEY == "YOUR_API_KEY_HERE":
        print("ERREUR: Veuillez configurer votre clé API OpenAI")
        print("Soit dans le fichier (ligne 10) ou comme variable d'environnement:")
        print("  set OPENAI_API_KEY=sk-...")
        sys.exit(1)

    # Récupérer le chemin de l'image
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        print("Usage: python ocr_openai.py <chemin_vers_image>")
        print("Exemple: python ocr_openai.py C:\\chemin\\vers\\menu.jpg")
        sys.exit(1)

    # Vérifier que le fichier existe
    if not os.path.exists(image_path):
        print(f"Erreur: Le fichier {image_path} n'existe pas")
        sys.exit(1)

    print(f"Extraction du menu depuis: {image_path}")
    print("Appel à l'API OpenAI Vision...")

    # Extraire le menu
    menu_data = extract_menu_with_openai(image_path)

    if menu_data:
        print("\nExtraction reussie!")

        # Formater et afficher
        formatted = format_menu_output(menu_data)
        print("\n" + formatted)

        # Sauvegarder les résultats
        json_path, txt_path = save_results(image_path, menu_data, formatted)

        print(f"\nResultats sauvegardes:")
        print(f"  - JSON: {json_path}")
        print(f"  - Texte: {txt_path}")

        # Afficher le JSON pour copier/coller facile
        print("\n" + "=" * 60)
        print("JSON POUR INTEGRATION:")
        print("=" * 60)
        print(json.dumps(menu_data, ensure_ascii=False, indent=2))

    else:
        print("\nEchec de l'extraction")

if __name__ == "__main__":
    main()