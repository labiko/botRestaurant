'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

interface StripeConfig {
  stripe_public_key: string;
  stripe_secret_key: string;
  stripe_webhook_secret: string;
  price_id_monthly: string;
  price_id_quarterly: string;
  price_id_annual: string;
  amount_monthly: number;
  amount_quarterly: number;
  amount_annual: number;
  environment: 'test' | 'live';
  notes: string;
}

export default function StripeConfigPage() {
  const { supabase, environment } = useSupabase();

  const [config, setConfig] = useState<StripeConfig>({
    stripe_public_key: '',
    stripe_secret_key: '',
    stripe_webhook_secret: '',
    price_id_monthly: '',
    price_id_quarterly: '',
    price_id_annual: '',
    amount_monthly: 49.00,
    amount_quarterly: 127.00,
    amount_annual: 420.00,
    environment: 'live',
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.functions.invoke('subscription-admin', {
        body: { action: 'get_config' }
      });

      if (data?.config) {
        setConfig({ ...config, ...data.config });
      }
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!validateConfig()) return;

    setIsSaving(true);
    setMessage('');
    try {
      const { error } = await supabase.functions.invoke('subscription-admin', {
        body: {
          action: 'update_config',
          config: config
        }
      });

      if (error) throw error;

      setMessage('✅ Configuration Stripe sauvegardée !');
    } catch (error) {
      setMessage('❌ Erreur sauvegarde');
      console.error('❌ Erreur:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    if (!config.stripe_secret_key) {
      setMessage('⚠️ Clé secrète requise');
      return;
    }

    setIsTesting(true);
    setMessage('');
    try {
      const { data } = await supabase.functions.invoke('subscription-admin', {
        body: {
          action: 'test_stripe',
          stripe_secret_key: config.stripe_secret_key
        }
      });

      if (data?.success) {
        setMessage(`✅ Connexion réussie !\nCompte: ${data.account.email}`);
      } else {
        setMessage(`❌ Échec: ${data?.error}`);
      }
    } catch (error) {
      setMessage('❌ Erreur test connexion');
      console.error('❌ Test échoué:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const validateConfig = (): boolean => {
    if (!config.stripe_public_key || !config.stripe_secret_key) {
      setMessage('⚠️ Clés Stripe requises');
      return false;
    }

    const publicPrefix = config.environment === 'test' ? 'pk_test_' : 'pk_live_';
    const secretPrefix = config.environment === 'test' ? 'sk_test_' : 'sk_live_';

    if (!config.stripe_public_key.startsWith(publicPrefix)) {
      setMessage(`⚠️ Clé publique doit commencer par ${publicPrefix}`);
      return false;
    }

    if (!config.stripe_secret_key.startsWith(secretPrefix)) {
      setMessage(`⚠️ Clé secrète doit commencer par ${secretPrefix}`);
      return false;
    }

    return true;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">⚙️ Configuration Stripe</h1>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
          environment === 'DEV' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
        }`}>
          {environment === 'DEV' ? '🔧 DEV' : '🚀 PROD'}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Environnement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Environnement
          </label>
          <select
            value={config.environment}
            onChange={(e) => setConfig({ ...config, environment: e.target.value as 'test' | 'live' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="test">🧪 Test</option>
            <option value="live">🚀 Production</option>
          </select>
        </div>

        {/* Clés API */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">🔑 Clés API Stripe</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clé Publique (pk_...)
              </label>
              <input
                type="text"
                value={config.stripe_public_key}
                onChange={(e) => setConfig({ ...config, stripe_public_key: e.target.value })}
                placeholder="pk_live_... ou pk_test_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clé Secrète (sk_...)
              </label>
              <input
                type="password"
                value={config.stripe_secret_key}
                onChange={(e) => setConfig({ ...config, stripe_secret_key: e.target.value })}
                placeholder="sk_live_... ou sk_test_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Secret (whsec_...)
              </label>
              <input
                type="text"
                value={config.stripe_webhook_secret}
                onChange={(e) => setConfig({ ...config, stripe_webhook_secret: e.target.value })}
                placeholder="whsec_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={testConnection}
              disabled={isTesting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isTesting ? 'Test en cours...' : '🧪 Tester Connexion'}
            </button>
          </div>
        </div>

        {/* Price IDs */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">💰 Plans & Prix</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ID Mensuel
                </label>
                <input
                  type="text"
                  value={config.price_id_monthly}
                  onChange={(e) => setConfig({ ...config, price_id_monthly: e.target.value })}
                  placeholder="price_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (€)
                </label>
                <input
                  type="number"
                  value={config.amount_monthly}
                  onChange={(e) => setConfig({ ...config, amount_monthly: parseFloat(e.target.value) })}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ID Trimestriel
                </label>
                <input
                  type="text"
                  value={config.price_id_quarterly}
                  onChange={(e) => setConfig({ ...config, price_id_quarterly: e.target.value })}
                  placeholder="price_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (€)
                </label>
                <input
                  type="number"
                  value={config.amount_quarterly}
                  onChange={(e) => setConfig({ ...config, amount_quarterly: parseFloat(e.target.value) })}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ID Annuel
                </label>
                <input
                  type="text"
                  value={config.price_id_annual}
                  onChange={(e) => setConfig({ ...config, price_id_annual: e.target.value })}
                  placeholder="price_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (€)
                </label>
                <input
                  type="number"
                  value={config.amount_annual}
                  onChange={(e) => setConfig({ ...config, amount_annual: parseFloat(e.target.value) })}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={config.notes}
            onChange={(e) => setConfig({ ...config, notes: e.target.value })}
            rows={3}
            placeholder="Notes de configuration..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-md ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <pre className="whitespace-pre-wrap">{message}</pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end">
          <button
            onClick={saveConfig}
            disabled={isSaving}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-semibold"
          >
            {isSaving ? 'Sauvegarde...' : '💾 Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
