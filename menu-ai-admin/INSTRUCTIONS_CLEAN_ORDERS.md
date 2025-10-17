# 🧹 INSTRUCTIONS - Ajout fonctionnalité Nettoyage Commandes

## 📋 Résumé
Ajouter un nouvel onglet "Nettoyage Commandes" dans le back-office restaurant permettant de supprimer toutes les commandes de test d'un restaurant en PROD ou DEV.

---

## ⚠️ IMPORTANT - Structure Base de Données

**CORRECTION v2** : Structure réelle vérifiée !
- Table `france_order_items` n'existe PAS → Items stockés dans `france_orders.items` (JSONB)
- Sessions nettoyées : `france_user_sessions` (contient `restaurant_id`)
- Toutes les tables liées ont `ON DELETE CASCADE` et seront automatiquement supprimées :
  - `delivery_driver_actions`
  - `delivery_order_logs`
  - `delivery_refusals`
  - `delivery_tokens`
  - `france_delivery_assignments`
  - `payment_links`

---

## ✅ Fichiers créés

1. **Fonction PostgreSQL v2** : `database/functions/clean_restaurant_orders.sql`
   - `preview_restaurant_orders_cleanup(p_restaurant_id)` : Aperçu complet avec CASCADE
   - `clean_restaurant_orders(p_restaurant_id)` : Nettoyage complet avec CASCADE

2. **Route API** : `src/app/api/clean-orders/route.ts`
   - POST : Aperçu des données à supprimer
   - DELETE : Exécution du nettoyage

---

## 🔧 Modifications à apporter dans `src/app/back-office-restaurant/page.tsx`

### 1️⃣ Ajouter les états (après ligne ~100)

```typescript
const [cleaningOrders, setCleaningOrders] = useState(false);
const [cleanPreview, setCleanPreview] = useState<any>(null);
const [showCleanModal, setShowCleanModal] = useState(false);
const [selectedRestaurantForClean, setSelectedRestaurantForClean] = useState<Restaurant | null>(null);
```

### 2️⃣ Ajouter les fonctions (après ligne ~1200)

```typescript
const previewOrdersCleanup = async (restaurant: Restaurant) => {
  try {
    setSelectedRestaurantForClean(restaurant);
    setCleaningOrders(true);
    setCleanPreview(null);

    const response = await fetchWithEnv('/api/clean-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId: restaurant.id })
    });

    const data = await response.json();

    if (!data.success) {
      alert(`Erreur: ${data.error}`);
      setCleaningOrders(false);
      return;
    }

    setCleanPreview(data.preview);
    setShowCleanModal(true);
    setCleaningOrders(false);
  } catch (error) {
    console.error('Erreur preview nettoyage:', error);
    alert('Erreur lors de la génération de l\'aperçu');
    setCleaningOrders(false);
  }
};

const cleanRestaurantOrders = async () => {
  if (!selectedRestaurantForClean) return;

  try {
    setCleaningOrders(true);

    const response = await fetchWithEnv('/api/clean-orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId: selectedRestaurantForClean.id })
    });

    const data = await response.json();

    if (!data.success) {
      alert(`Erreur: ${data.error}`);
      setCleaningOrders(false);
      return;
    }

    const cascadeTotal = data.statisticsDeleted.cascade_deleted.delivery_actions +
                        data.statisticsDeleted.cascade_deleted.delivery_logs +
                        data.statisticsDeleted.cascade_deleted.delivery_refusals +
                        data.statisticsDeleted.cascade_deleted.delivery_tokens +
                        data.statisticsDeleted.cascade_deleted.delivery_assignments +
                        data.statisticsDeleted.cascade_deleted.payment_links;

    alert(`✅ Nettoyage réussi!\n\nRestaurant: ${data.restaurant.name}\nCommandes supprimées: ${data.statisticsDeleted.orders}\nSessions supprimées: ${data.statisticsDeleted.sessions}\nDonnées cascade: ${cascadeTotal}\nTOTAL: ${data.statisticsDeleted.total_records}`);

    setShowCleanModal(false);
    setCleanPreview(null);
    setSelectedRestaurantForClean(null);
    setCleaningOrders(false);
  } catch (error) {
    console.error('Erreur nettoyage:', error);
    alert('Erreur lors du nettoyage des commandes');
    setCleaningOrders(false);
  }
};
```

### 3️⃣ Ajouter le bouton dans la navigation (après le dernier bouton tab, ligne ~1340)

```typescript
<button
  onClick={() => setActiveTab('clean-orders')}
  className={`px-6 py-3 rounded-lg transition-all ${
    activeTab === 'clean-orders'
      ? 'bg-red-600 text-white shadow-lg'
      : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-700'
  }`}
>
  🧹 Nettoyage Commandes
</button>
```

### 4️⃣ Ajouter la section du tab (après le dernier `activeTab === '...'`, ligne ~3800)

```typescript
{activeTab === 'clean-orders' && (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-8 text-white shadow-xl">
      <h2 className="text-3xl font-bold mb-2">🧹 Nettoyage des Commandes</h2>
      <p className="text-red-100">Supprimez toutes les commandes de test d'un restaurant (PROD/DEV)</p>
      <p className="text-sm text-red-200 mt-2">⚠️ Attention : Action irréversible !</p>
    </div>

    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Sélectionnez un restaurant</h3>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-red-50 transition-all">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{restaurant.name}</h4>
                <p className="text-sm text-gray-600">ID: {restaurant.id} • {restaurant.city}</p>
              </div>
              <button
                onClick={() => previewOrdersCleanup(restaurant)}
                disabled={cleaningOrders}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {cleaningOrders ? '⏳ Chargement...' : '🧹 Nettoyer les commandes'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
```

### 5️⃣ Ajouter la modal de confirmation (à la fin du JSX, avant la fermeture du `return`)

```typescript
{showCleanModal && selectedRestaurantForClean && cleanPreview && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 rounded-t-2xl text-white">
        <h3 className="text-2xl font-bold mb-2">⚠️ Confirmation de nettoyage</h3>
        <p className="text-red-100">Restaurant: <span className="font-bold">{selectedRestaurantForClean.name}</span></p>
      </div>

      <div className="p-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
          <h4 className="text-lg font-bold text-red-800 mb-4">📊 Données qui seront supprimées :</h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center border border-red-200">
              <div className="text-3xl font-bold text-red-600">{cleanPreview.orders}</div>
              <div className="text-sm text-gray-600 mt-1">Commandes</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-red-200">
              <div className="text-3xl font-bold text-red-600">{cleanPreview.sessions}</div>
              <div className="text-sm text-gray-600 mt-1">Sessions</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-red-200">
              <div className="text-3xl font-bold text-red-600">{cleanPreview.delivery_assignments}</div>
              <div className="text-sm text-gray-600 mt-1">Assignations</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-red-200">
              <div className="text-3xl font-bold text-red-600">{cleanPreview.delivery_logs}</div>
              <div className="text-sm text-gray-600 mt-1">Logs</div>
            </div>
          </div>

          {(cleanPreview.delivery_actions > 0 || cleanPreview.delivery_refusals > 0 ||
            cleanPreview.delivery_tokens > 0 || cleanPreview.payment_links > 0) && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center border border-red-200">
                <div className="text-2xl font-bold text-red-600">{cleanPreview.delivery_actions}</div>
                <div className="text-sm text-gray-600 mt-1">Actions livreurs</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-red-200">
                <div className="text-2xl font-bold text-red-600">{cleanPreview.delivery_refusals}</div>
                <div className="text-sm text-gray-600 mt-1">Refus</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-red-200">
                <div className="text-2xl font-bold text-red-600">{cleanPreview.delivery_tokens}</div>
                <div className="text-sm text-gray-600 mt-1">Tokens</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-red-200">
                <div className="text-2xl font-bold text-red-600">{cleanPreview.payment_links}</div>
                <div className="text-sm text-gray-600 mt-1">Liens paiement</div>
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-white rounded-lg border border-red-300">
            <p className="text-center font-bold text-red-700">TOTAL: {cleanPreview.total_records} enregistrements</p>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className="font-bold text-yellow-800">Cette action est irréversible !</p>
              <p className="text-sm text-yellow-700 mt-1">Toutes les commandes de test du restaurant seront définitivement supprimées.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              setShowCleanModal(false);
              setCleanPreview(null);
              setSelectedRestaurantForClean(null);
            }}
            disabled={cleaningOrders}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium transition-all"
          >
            ❌ Annuler
          </button>
          <button
            onClick={cleanRestaurantOrders}
            disabled={cleaningOrders}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-bold transition-all"
          >
            {cleaningOrders ? '⏳ Nettoyage en cours...' : '🧹 Confirmer le nettoyage'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
```

---

## 🗃️ Déploiement de la fonction PostgreSQL

### DEV
```bash
psql "postgresql://postgres:p4zN25F7Gfw9Py@db.lphvdoyhwaelmwdfkfuh.supabase.co:5432/postgres" < database/functions/clean_restaurant_orders.sql
```

### PROD
```bash
psql "postgresql://postgres:p4zN25F7Gfw9Py@db.vywbhlnzvfqtiurwmrac.supabase.co:5432/postgres" < database/functions/clean_restaurant_orders.sql
```

---

## ✅ Résultat attendu

1. Un nouvel onglet **"🧹 Nettoyage Commandes"** dans le back-office
2. Liste de tous les restaurants avec bouton "Nettoyer les commandes"
3. Modal de confirmation affichant le nombre de commandes/items/sessions à supprimer
4. Utilisation automatique du sélecteur PROD/DEV via `useFetch()`
5. Aucune régression sur les fonctionnalités existantes

---

## 🔒 Sécurité

- Confirmation obligatoire avant suppression
- Aperçu des données avant action
- Logs détaillés côté serveur
- Sélecteur d'environnement (PROD/DEV)
- Vérification de l'existence du restaurant
