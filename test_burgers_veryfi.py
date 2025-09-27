import requests
import json
import time
import os
import base64

class BurgersVeryfiTester:
    def __init__(self):
        # Configuration Veryfi
        self.VERYFI_CLIENT_ID = "vrf2KValFh7I9yhzD7SCkvWRBEGaPwswEjl9FeO"
        self.VERYFI_CLIENT_SECRET = "vb81WdUdpuTwXC6GTpH1smrJDYUMrAnu1DU5TH5Nto74MEmn9ZT86ZUy0Da1LI6a5Mk8bNuaYmLFH12ermEpVJ0ZdeFV5GFNZwYmDE4pPjdW4gKyWBTp6P6n5eEDGP"
        self.VERYFI_API_KEY = "6834773626087ca139328fffcf11f453"
        self.VERYFI_USERNAME = "alpha.diallo.mdalpha"
        self.VERYFI_ENDPOINT = "https://api.veryfi.com/api/v8/partner/documents/"

        # Configuration OpenAI
        self.OPENAI_API_KEY = "your-openai-api-key-here"

    def test_veryfi_ocr(self, image_path):
        """Test Veryfi OCR sur une image"""
        print(f"\n[VERYFI] Test sur : {image_path}")

        try:
            start_time = time.time()

            # Encoder l'image en base64
            with open(image_path, 'rb') as image_file:
                image_base64 = base64.b64encode(image_file.read()).decode('utf-8')

            # Headers Veryfi - Format correct selon documentation
            headers = {
                'CLIENT-ID': self.VERYFI_CLIENT_ID,
                'AUTHORIZATION': f'apikey {self.VERYFI_USERNAME}:{self.VERYFI_API_KEY}',
                'Content-Type': 'application/json'
            }

            # Payload avec image
            payload = {
                'file_name': os.path.basename(image_path),
                'file_data': image_base64,
                'categories': ['Restaurant Menu'],
                'boost_mode': 1
            }

            print("[VERYFI] Envoi de la requete...")
            response = requests.post(self.VERYFI_ENDPOINT,
                                   headers=headers,
                                   json=payload,
                                   timeout=30)

            processing_time = time.time() - start_time

            if response.status_code == 201:
                data = response.json()
                print(f"[VERYFI] SUCCESS - Temps: {processing_time:.2f}s")

                # Afficher quelques données extraites
                if 'line_items' in data:
                    print(f"[VERYFI] Produits detectes: {len(data['line_items'])}")
                    for i, item in enumerate(data['line_items'][:3], 1):
                        print(f"  {i}. {item.get('description', 'N/A')} - {item.get('total', 'N/A')}")

                return {
                    'success': True,
                    'provider': 'veryfi',
                    'processing_time': processing_time,
                    'raw_response': data,
                    'products_count': len(data.get('line_items', []))
                }
            else:
                print(f"[VERYFI] ERROR {response.status_code}: {response.text}")
                return {
                    'success': False,
                    'provider': 'veryfi',
                    'error': f"HTTP {response.status_code}: {response.text}",
                    'processing_time': processing_time
                }

        except Exception as e:
            print(f"[VERYFI] EXCEPTION: {str(e)}")
            return {
                'success': False,
                'provider': 'veryfi',
                'error': str(e)
            }

    def test_openai_ocr(self, image_path):
        """Test OpenAI OCR sur une image"""
        print(f"\n[OPENAI] Test sur : {image_path}")

        try:
            start_time = time.time()

            # Encoder l'image en base64
            with open(image_path, 'rb') as image_file:
                image_base64 = base64.b64encode(image_file.read()).decode('utf-8')

            headers = {
                'Authorization': f'Bearer {self.OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            }

            prompt = """
            Analyse cette image de menu restaurant et extrais TOUS les produits.

            INSTRUCTIONS:
            1. Compte le nombre EXACT de produits visibles
            2. Extrais TOUS les produits avec leur nom et prix
            3. Prix SUR PLACE uniquement (pas livraison)
            4. Inclus tous les produits même ceux avec noms courts comme "180", "270"

            Format JSON:
            {
              "total_products_detected": nombre,
              "products": [
                {
                  "name": "nom exact",
                  "description": "description complete",
                  "price_onsite": prix_en_euros,
                  "currency": "€"
                }
              ]
            }
            """

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

            print("[OPENAI] Envoi de la requete...")
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
                    products_count = len(parsed_content.get('products', []))

                    print(f"[OPENAI] SUCCESS - Temps: {processing_time:.2f}s")
                    print(f"[OPENAI] Produits detectes: {products_count}")

                    # Afficher quelques produits
                    for i, product in enumerate(parsed_content.get('products', [])[:3], 1):
                        print(f"  {i}. {product.get('name', 'N/A')} - {product.get('price_onsite', 'N/A')}€")

                    return {
                        'success': True,
                        'provider': 'openai',
                        'processing_time': processing_time,
                        'extracted_data': parsed_content,
                        'products_count': products_count
                    }
                except json.JSONDecodeError as e:
                    print(f"[OPENAI] JSON Parse Error: {e}")
                    return {
                        'success': False,
                        'provider': 'openai',
                        'error': f"JSON Parse Error: {e}",
                        'processing_time': processing_time
                    }
            else:
                print(f"[OPENAI] ERROR {response.status_code}: {response.text}")
                return {
                    'success': False,
                    'provider': 'openai',
                    'error': f"HTTP {response.status_code}: {response.text}",
                    'processing_time': processing_time
                }

        except Exception as e:
            print(f"[OPENAI] EXCEPTION: {str(e)}")
            return {
                'success': False,
                'provider': 'openai',
                'error': str(e)
            }

def main():
    print("=== TEST VERYFI vs OPENAI - BURGERS ===")

    # Image de test - burgers
    image_path = r"C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\CATEGORIES\BURGERS\burgers.jpg"

    if not os.path.exists(image_path):
        print(f"ERREUR: Image non trouvee: {image_path}")
        return

    tester = BurgersVeryfiTester()

    print(f"\nTEST SUR: {image_path}")
    print("="*60)

    # Test Veryfi
    veryfi_result = tester.test_veryfi_ocr(image_path)

    # Test OpenAI
    openai_result = tester.test_openai_ocr(image_path)

    # Comparaison simple
    print("\n=== COMPARAISON ===")
    print(f"Veryfi Success: {veryfi_result['success'] if veryfi_result else False}")
    print(f"OpenAI Success: {openai_result['success'] if openai_result else False}")

    if veryfi_result and veryfi_result['success'] and openai_result and openai_result['success']:
        print(f"Veryfi Temps: {veryfi_result['processing_time']:.2f}s")
        print(f"OpenAI Temps: {openai_result['processing_time']:.2f}s")
        print(f"Veryfi Produits: {veryfi_result.get('products_count', 0)}")
        print(f"OpenAI Produits: {openai_result.get('products_count', 0)}")

    # Sauvegarder les résultats
    results = {
        'image': 'burgers',
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        'veryfi': veryfi_result,
        'openai': openai_result
    }

    with open('burgers_test_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\nResultats sauvegardes dans: burgers_test_results.json")

if __name__ == "__main__":
    main()