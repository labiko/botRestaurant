import requests
import json
import time
import os
from pathlib import Path
import base64

class VeryfiTester:
    def __init__(self):
        # Configuration Veryfi - À remplir avec vos clés d'essai
        self.VERYFI_CLIENT_ID = os.getenv("VERYFI_CLIENT_ID", "YOUR_CLIENT_ID")
        self.VERYFI_API_KEY = os.getenv("VERYFI_API_KEY", "YOUR_API_KEY")
        self.VERYFI_USERNAME = os.getenv("VERYFI_USERNAME", "YOUR_USERNAME")
        self.VERYFI_ENDPOINT = "https://api.veryfi.com/api/v8/partner/documents/"

        # Configuration OpenAI (existante)
        self.OPENAI_API_KEY = "your-openai-api-key-here"

    def test_veryfi_ocr(self, image_path):
        """Test Veryfi OCR sur une image"""
        print(f"\n🔍 Test Veryfi sur : {image_path}")

        if self.VERYFI_CLIENT_ID == "YOUR_CLIENT_ID":
            print("❌ ERREUR: Veuillez configurer vos clés Veryfi")
            return None

        try:
            start_time = time.time()

            # Encoder l'image en base64
            with open(image_path, 'rb') as image_file:
                image_base64 = base64.b64encode(image_file.read()).decode('utf-8')

            # Headers Veryfi
            headers = {
                'CLIENT-ID': self.VERYFI_CLIENT_ID,
                'AUTHORIZATION': f'apikey {self.VERYFI_USERNAME}:{self.VERYFI_API_KEY}',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }

            # Payload avec image
            payload = {
                'file_name': os.path.basename(image_path),
                'file_data': image_base64,
                'categories': ['Restaurant Menu'],
                'boost_mode': 1  # Mode haute précision
            }

            # Appel API Veryfi
            response = requests.post(self.VERYFI_ENDPOINT,
                                   headers=headers,
                                   json=payload,
                                   timeout=30)

            processing_time = time.time() - start_time

            if response.status_code == 201:
                data = response.json()
                print(f"✅ Veryfi SUCCESS - Temps: {processing_time:.2f}s")
                return {
                    'success': True,
                    'provider': 'veryfi',
                    'processing_time': processing_time,
                    'raw_response': data,
                    'extracted_data': self.parse_veryfi_response(data)
                }
            else:
                print(f"❌ Veryfi ERROR {response.status_code}: {response.text}")
                return {
                    'success': False,
                    'provider': 'veryfi',
                    'error': f"HTTP {response.status_code}: {response.text}",
                    'processing_time': processing_time
                }

        except Exception as e:
            print(f"❌ Veryfi EXCEPTION: {str(e)}")
            return {
                'success': False,
                'provider': 'veryfi',
                'error': str(e),
                'processing_time': time.time() - start_time
            }

    def test_openai_ocr(self, image_path):
        """Test OpenAI OCR sur une image (réutilise le script existant)"""
        print(f"\n🔍 Test OpenAI sur : {image_path}")

        try:
            start_time = time.time()

            # Encoder l'image en base64
            with open(image_path, 'rb') as image_file:
                image_base64 = base64.b64encode(image_file.read()).decode('utf-8')

            # Headers OpenAI
            headers = {
                'Authorization': f'Bearer {self.OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            }

            # Prompt optimisé (même que dans ocr_openai.py)
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

            Format JSON requis:
            {
              "menu_title": "titre exact du menu",
              "menu_info": "informations sur le service",
              "total_products_detected": nombre_total_de_produits_vus,
              "products": [
                {
                  "name": "nom exact du produit",
                  "description": "description complète avec tous les ingrédients",
                  "price_onsite": nombre_exact_en_euros,
                  "price_delivery": nombre_exact_en_euros,
                  "currency": "€"
                }
              ]
            }

            Retourne UNIQUEMENT le JSON, sans aucun texte avant ou après.
            """

            # Payload OpenAI
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                "max_tokens": 3000,
                "temperature": 0
            }

            # Appel API OpenAI
            response = requests.post('https://api.openai.com/v1/chat/completions',
                                   headers=headers,
                                   json=payload,
                                   timeout=30)

            processing_time = time.time() - start_time

            if response.status_code == 200:
                data = response.json()
                content = data['choices'][0]['message']['content'].strip()

                # Parser le JSON
                try:
                    if content.startswith("```json"):
                        content = content[7:]
                    if content.endswith("```"):
                        content = content[:-3]

                    parsed_content = json.loads(content)

                    print(f"✅ OpenAI SUCCESS - Temps: {processing_time:.2f}s")
                    return {
                        'success': True,
                        'provider': 'openai',
                        'processing_time': processing_time,
                        'raw_response': data,
                        'extracted_data': parsed_content
                    }
                except json.JSONDecodeError as e:
                    print(f"❌ OpenAI JSON Parse Error: {e}")
                    return {
                        'success': False,
                        'provider': 'openai',
                        'error': f"JSON Parse Error: {e}",
                        'raw_content': content,
                        'processing_time': processing_time
                    }
            else:
                print(f"❌ OpenAI ERROR {response.status_code}: {response.text}")
                return {
                    'success': False,
                    'provider': 'openai',
                    'error': f"HTTP {response.status_code}: {response.text}",
                    'processing_time': processing_time
                }

        except Exception as e:
            print(f"❌ OpenAI EXCEPTION: {str(e)}")
            return {
                'success': False,
                'provider': 'openai',
                'error': str(e),
                'processing_time': time.time() - start_time
            }

    def parse_veryfi_response(self, veryfi_data):
        """Convertit la réponse Veryfi en format comparable"""
        try:
            # Veryfi retourne des données structurées différemment
            # Il faut adapter selon la réponse réelle de l'API

            products = []

            # Veryfi peut retourner des line_items pour les menus
            if 'line_items' in veryfi_data:
                for item in veryfi_data['line_items']:
                    products.append({
                        'name': item.get('description', ''),
                        'description': item.get('sku', ''),
                        'price_onsite': item.get('total', 0),
                        'price_delivery': item.get('total', 0) + 1 if item.get('total') else None,
                        'currency': '€'
                    })

            # Ou des custom_fields si c'est un menu spécialisé
            elif 'custom_fields' in veryfi_data:
                # À adapter selon la structure réelle de Veryfi
                pass

            return {
                'menu_title': veryfi_data.get('vendor', {}).get('name', 'Menu détecté'),
                'total_products_detected': len(products),
                'products': products,
                'confidence': 99  # Veryfi annonce 99%
            }

        except Exception as e:
            print(f"⚠️ Erreur parsing Veryfi: {e}")
            return {
                'menu_title': 'Erreur de parsing',
                'total_products_detected': 0,
                'products': [],
                'confidence': 0
            }

    def compare_results(self, veryfi_result, openai_result):
        """Compare les résultats des deux providers"""
        print("\n" + "="*80)
        print("📊 COMPARAISON DES RÉSULTATS")
        print("="*80)

        # Tableau de comparaison
        print(f"{'Critère':<25} {'Veryfi':<20} {'OpenAI':<20} {'Gagnant':<15}")
        print("-" * 80)

        # Succès
        veryfi_success = veryfi_result['success'] if veryfi_result else False
        openai_success = openai_result['success'] if openai_result else False
        success_winner = "Égalité" if veryfi_success == openai_success else ("Veryfi" if veryfi_success else "OpenAI")
        print(f"{'Succès':<25} {veryfi_success:<20} {openai_success:<20} {success_winner:<15}")

        if veryfi_success and openai_success:
            # Temps de traitement
            veryfi_time = veryfi_result['processing_time']
            openai_time = openai_result['processing_time']
            time_winner = "Veryfi" if veryfi_time < openai_time else "OpenAI"
            print(f"{'Temps (s)':<25} {veryfi_time:.2f:<20} {openai_time:.2f:<20} {time_winner:<15}")

            # Nombre de produits détectés
            veryfi_products = len(veryfi_result['extracted_data'].get('products', []))
            openai_products = len(openai_result['extracted_data'].get('products', []))
            products_winner = "Veryfi" if veryfi_products > openai_products else ("OpenAI" if openai_products > veryfi_products else "Égalité")
            print(f"{'Produits détectés':<25} {veryfi_products:<20} {openai_products:<20} {products_winner:<15}")

            # Confiance
            veryfi_conf = veryfi_result['extracted_data'].get('confidence', 0)
            openai_conf = 85  # Estimation moyenne OpenAI
            conf_winner = "Veryfi" if veryfi_conf > openai_conf else "OpenAI"
            print(f"{'Confiance (%)':<25} {veryfi_conf:<20} {openai_conf:<20} {conf_winner:<15}")

        print("\n📋 DÉTAILS DES EXTRACTIONS:")
        print("-" * 50)

        if veryfi_result and veryfi_result['success']:
            print("\n🔹 VERYFI - Produits extraits:")
            for i, product in enumerate(veryfi_result['extracted_data'].get('products', []), 1):
                print(f"  {i}. {product.get('name', 'N/A')} - {product.get('price_onsite', 'N/A')}€")
        else:
            print("\n❌ VERYFI - Échec d'extraction")
            if veryfi_result:
                print(f"   Erreur: {veryfi_result.get('error', 'Inconnue')}")

        if openai_result and openai_result['success']:
            print("\n🔹 OPENAI - Produits extraits:")
            for i, product in enumerate(openai_result['extracted_data'].get('products', []), 1):
                print(f"  {i}. {product.get('name', 'N/A')} - {product.get('price_onsite', 'N/A')}€")
        else:
            print("\n❌ OPENAI - Échec d'extraction")
            if openai_result:
                print(f"   Erreur: {openai_result.get('error', 'Inconnue')}")

    def save_results(self, image_name, veryfi_result, openai_result):
        """Sauvegarde les résultats dans des fichiers JSON"""
        results_dir = Path("comparison_results")
        results_dir.mkdir(exist_ok=True)

        # Sauvegarder les résultats complets
        comparison_data = {
            'image': image_name,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'veryfi': veryfi_result,
            'openai': openai_result
        }

        filename = f"{results_dir}/{image_name}_comparison.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(comparison_data, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Résultats sauvegardés dans: {filename}")

def main():
    print("🚀 TEST DE COMPARAISON VERYFI vs OPENAI")
    print("="*60)

    # Images de test (nos références)
    test_images = [
        {
            'path': r"C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\CATEGORIES\BURGERS\burgers.jpg",
            'name': 'burgers'
        },
        {
            'path': r"C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\CATEGORIES\ASSIETTES\assiete.jpg",
            'name': 'assiettes'
        },
        {
            'path': r"C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\CATEGORIES\GOURMETS\gourmet.jpg",
            'name': 'gourmets'
        },
        {
            'path': r"C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\CATEGORIES\AUTRES\autres.jpg",
            'name': 'autres'
        }
    ]

    tester = VeryfiTester()

    # Vérifier la configuration
    print("\n🔧 Vérification de la configuration:")
    print(f"OpenAI API Key: {'✅ Configuré' if tester.OPENAI_API_KEY != 'YOUR_API_KEY' else '❌ Non configuré'}")
    print(f"Veryfi Client ID: {'✅ Configuré' if tester.VERYFI_CLIENT_ID != 'YOUR_CLIENT_ID' else '❌ Non configuré'}")

    if tester.VERYFI_CLIENT_ID == "YOUR_CLIENT_ID":
        print("\n⚠️  CONFIGURATION VERYFI REQUISE:")
        print("1. Créez un compte d'essai sur https://www.veryfi.com/")
        print("2. Obtenez vos clés API (14 jours gratuit)")
        print("3. Configurez les variables d'environnement:")
        print("   export VERYFI_CLIENT_ID='votre-client-id'")
        print("   export VERYFI_API_KEY='votre-api-key'")
        print("   export VERYFI_USERNAME='votre-username'")
        print("\nOu modifiez directement le script avec vos clés.")
        print("\n▶️  Pour l'instant, seul OpenAI sera testé.")

    # Tester chaque image
    for image_info in test_images:
        image_path = image_info['path']
        image_name = image_info['name']

        if not os.path.exists(image_path):
            print(f"\n⚠️  Image non trouvée: {image_path}")
            continue

        print(f"\n\n🖼️  TESTING: {image_name.upper()}")
        print("="*60)

        # Test Veryfi
        veryfi_result = tester.test_veryfi_ocr(image_path)

        # Test OpenAI
        openai_result = tester.test_openai_ocr(image_path)

        # Comparaison
        tester.compare_results(veryfi_result, openai_result)

        # Sauvegarde
        tester.save_results(image_name, veryfi_result, openai_result)

        # Pause entre les tests
        print(f"\n⏳ Pause 2s avant l'image suivante...")
        time.sleep(2)

    print("\n\n🏁 TESTS TERMINÉS!")
    print("📁 Consultez le dossier 'comparison_results' pour les détails complets.")

if __name__ == "__main__":
    main()