import requests
import json
import os

def setup_veryfi_trial():
    """Guide d'installation et de configuration de Veryfi pour les tests"""

    print("🚀 CONFIGURATION VERYFI - ESSAI GRATUIT 14 JOURS")
    print("="*60)

    print("\n📋 ÉTAPES DE CONFIGURATION:")
    print("1. Créer un compte d'essai Veryfi")
    print("2. Obtenir les clés API")
    print("3. Configurer l'environnement")
    print("4. Tester l'API")

    print("\n" + "-"*50)
    print("ÉTAPE 1: INSCRIPTION VERYFI")
    print("-"*50)
    print("🌐 Allez sur: https://www.veryfi.com/")
    print("📝 Cliquez sur 'Start Free Trial' ou 'Get Started'")
    print("✅ Créez votre compte (email + mot de passe)")
    print("📧 Confirmez votre email")

    print("\n" + "-"*50)
    print("ÉTAPE 2: RÉCUPÉRER LES CLÉS API")
    print("-"*50)
    print("🔑 Une fois connecté, allez dans la section 'API Keys'")
    print("📋 Notez ces 3 informations importantes:")
    print("   • Client ID")
    print("   • API Key")
    print("   • Username")

    print("\n" + "-"*50)
    print("ÉTAPE 3: CONFIGURATION LOCALE")
    print("-"*50)

    # Méthode 1: Variables d'environnement
    print("🔧 MÉTHODE 1 - Variables d'environnement (recommandé):")
    print("Windows (PowerShell):")
    print("  $env:VERYFI_CLIENT_ID='votre-client-id'")
    print("  $env:VERYFI_API_KEY='votre-api-key'")
    print("  $env:VERYFI_USERNAME='votre-username'")
    print("")
    print("Windows (CMD):")
    print("  set VERYFI_CLIENT_ID=votre-client-id")
    print("  set VERYFI_API_KEY=votre-api-key")
    print("  set VERYFI_USERNAME=votre-username")

    # Méthode 2: Modification directe du script
    print("\n🔧 MÉTHODE 2 - Modification directe du script:")
    print("Ouvrez test_veryfi_comparison.py et modifiez les lignes:")
    print("  self.VERYFI_CLIENT_ID = 'votre-client-id'")
    print("  self.VERYFI_API_KEY = 'votre-api-key'")
    print("  self.VERYFI_USERNAME = 'votre-username'")

    print("\n" + "-"*50)
    print("ÉTAPE 4: TEST DE L'API")
    print("-"*50)
    print("🧪 Exécutez le script de test:")
    print("  python test_veryfi_comparison.py")

    print("\n" + "-"*50)
    print("INFORMATIONS IMPORTANTES")
    print("-"*50)
    print("💰 Essai gratuit: 14 jours + 100 documents")
    print("⚡ Pas de carte de crédit requise")
    print("📊 Spécialisé dans les menus de restaurants")
    print("🎯 99%+ de précision annoncée")

    # Test de connectivité
    print("\n🌐 Test de connectivité API Veryfi...")
    try:
        response = requests.get("https://api.veryfi.com/api/v8/partner/documents/", timeout=5)
        if response.status_code in [401, 403]:  # Erreurs d'auth attendues
            print("✅ API Veryfi accessible (erreur d'auth normale sans clés)")
        else:
            print(f"⚠️  Réponse inattendue: {response.status_code}")
    except requests.RequestException as e:
        print(f"❌ Problème de connectivité: {e}")

    print("\n" + "="*60)
    print("✅ CONFIGURATION TERMINÉE")
    print("▶️  Lancez maintenant: python test_veryfi_comparison.py")
    print("="*60)

def check_veryfi_config():
    """Vérifie si Veryfi est correctement configuré"""

    client_id = os.getenv("VERYFI_CLIENT_ID", "")
    api_key = os.getenv("VERYFI_API_KEY", "")
    username = os.getenv("VERYFI_USERNAME", "")

    print("\n🔍 VÉRIFICATION DE LA CONFIGURATION")
    print("-"*40)
    print(f"Client ID: {'✅ OK' if client_id else '❌ Manquant'}")
    print(f"API Key: {'✅ OK' if api_key else '❌ Manquant'}")
    print(f"Username: {'✅ OK' if username else '❌ Manquant'}")

    if client_id and api_key and username:
        print("\n✅ Configuration complète !")
        print("▶️  Vous pouvez lancer le test de comparaison.")
        return True
    else:
        print("\n❌ Configuration incomplète.")
        print("▶️  Suivez le guide de configuration ci-dessus.")
        return False

def test_veryfi_simple():
    """Test simple de l'API Veryfi"""

    client_id = os.getenv("VERYFI_CLIENT_ID", "")
    api_key = os.getenv("VERYFI_API_KEY", "")
    username = os.getenv("VERYFI_USERNAME", "")

    if not all([client_id, api_key, username]):
        print("❌ Clés Veryfi manquantes")
        return False

    print("\n🧪 TEST SIMPLE VERYFI API")
    print("-"*30)

    try:
        headers = {
            'CLIENT-ID': client_id,
            'AUTHORIZATION': f'apikey {username}:{api_key}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }

        # Test avec un appel simple (liste des documents)
        response = requests.get('https://api.veryfi.com/api/v8/partner/documents/',
                              headers=headers,
                              timeout=10)

        if response.status_code == 200:
            print("✅ API Veryfi: Connexion réussie !")
            data = response.json()
            print(f"📊 Documents dans votre compte: {len(data.get('results', []))}")
            return True
        elif response.status_code == 401:
            print("❌ Erreur d'authentification - Vérifiez vos clés")
            return False
        else:
            print(f"⚠️  Réponse inattendue: {response.status_code}")
            print(f"Détails: {response.text}")
            return False

    except requests.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")
        return False

if __name__ == "__main__":
    print("🔧 SETUP VERYFI POUR TESTS DE COMPARAISON")

    # Vérifier la config existante
    if check_veryfi_config():
        # Config OK, tester l'API
        if test_veryfi_simple():
            print("\n🎉 TOUT EST PRÊT !")
            print("▶️  Lancez: python test_veryfi_comparison.py")
        else:
            print("\n❌ Problème avec l'API - Vérifiez vos clés")
    else:
        # Config manquante, afficher le guide
        setup_veryfi_trial()