'use client';

import { useState, useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch';

interface HealthLog {
  id: number;
  checked_at: string;
  status: 'healthy' | 'unhealthy' | 'rebooted' | 'critical_failure';
  state_instance?: string;
  error_message?: string;
  reboot_triggered: boolean;
  reboot_success?: boolean;
  response_time_ms?: number;
  support_notified: boolean;
  support_notification_sent_at?: string;
  trigger_type?: 'automatic' | 'scheduled' | 'manual';
}

interface SupportContact {
  id: number;
  contact_type: string;
  phone_number: string;
  full_name: string;
  is_active: boolean;
  notification_priority: number;
}

interface Stats {
  totalChecks: number;
  healthyChecks: number;
  rebootsTriggered: number;
  supportNotifications: number;
  uptime: string;
}

interface ScheduledRebootConfig {
  id: number;
  scheduled_time: string;
  timezone: string;
  is_enabled: boolean;
  last_executed_at?: string;
}

export default function GreenAPIHealthPage() {
  const { fetch: fetchWithEnv } = useFetch();
  // Tab state
  const [activeTab, setActiveTab] = useState<'monitoring' | 'scheduled'>('monitoring');

  // Monitoring tab states
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scheduled reboot tab states
  const [rebootConfig, setRebootConfig] = useState<ScheduledRebootConfig>({
    id: 1,
    scheduled_time: '03:00:00',
    timezone: 'Europe/Paris',
    is_enabled: false
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    loadRebootConfig();
    const interval = setInterval(loadData, 60000);

    // Polling désactivé - Les jobs cron gèrent automatiquement les reboots planifiés
    // const queueInterval = setInterval(processQueue, 30000);

    return () => {
      clearInterval(interval);
      // clearInterval(queueInterval);
    };
  }, []);

  async function loadData() {
    try {
      const response = await fetchWithEnv('/api/green-api-health');
      if (!response.ok) throw new Error('Erreur chargement données');

      const data = await response.json();
      setLogs(data.logs || []);
      setContacts(data.contacts || []);
      setStats(data.stats || null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadRebootConfig() {
    try {
      const response = await fetchWithEnv('/api/green-api-health/scheduled-reboot');
      if (!response.ok) throw new Error('Erreur chargement config');

      const data = await response.json();
      setRebootConfig(data);
    } catch (err) {
      console.error('Error loading reboot config:', err);
    }
  }

  async function saveRebootConfig() {
    try {
      setSavingConfig(true);
      setConfigSuccess(null);

      const response = await fetchWithEnv('/api/green-api-health/scheduled-reboot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_time: rebootConfig.scheduled_time.substring(0, 5), // "03:00:00" -> "03:00"
          is_enabled: rebootConfig.is_enabled
        })
      });

      if (!response.ok) throw new Error('Erreur sauvegarde config');

      setConfigSuccess('Configuration sauvegardée avec succès');
      setTimeout(() => setConfigSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingConfig(false);
    }
  }

  async function triggerManualCheck() {
    try {
      setLoading(true);
      const response = await fetchWithEnv('/api/green-api-health/manual-check', {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Erreur déclenchement check');

      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function processQueue() {
    try {
      // Traiter les deux queues en parallèle
      const [rebootResponse, healthResponse] = await Promise.all([
        fetch('/api/green-api-health/process-queue', { method: 'POST' }),
        fetch('/api/green-api-health/process-health-queue', { method: 'POST' })
      ]);

      let shouldReload = false;

      if (rebootResponse.ok) {
        const rebootResult = await rebootResponse.json();
        if (rebootResult.processed > 0) shouldReload = true;
      }

      if (healthResponse.ok) {
        const healthResult = await healthResponse.json();
        if (healthResult.processed > 0) shouldReload = true;
      }

      if (shouldReload) {
        await loadData();
        await loadRebootConfig();
      }
    } catch (err) {
      // Ignorer les erreurs de queue en silence
      console.error('Queue processing error:', err);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'rebooted': return 'text-blue-600 bg-blue-50';
      case 'unhealthy': return 'text-orange-600 bg-orange-50';
      case 'critical_failure': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'healthy': return '✅';
      case 'rebooted': return '🔄';
      case 'unhealthy': return '⚠️';
      case 'critical_failure': return '🔴';
      default: return '❓';
    }
  }

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📊 Green API Health Monitor
              </h1>
              <p className="text-gray-600 mt-2">
                Surveillance automatique • Environnement DEV
              </p>
            </div>
            {activeTab === 'monitoring' && (
              <button
                onClick={triggerManualCheck}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Vérification...' : '🔄 Check Manuel'}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'monitoring'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Monitoring
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'scheduled'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔄 Reboot Planifié
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* Tab Content: Monitoring */}
        {activeTab === 'monitoring' && (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">Total Checks (24h)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalChecks}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">Healthy</p>
                  <p className="text-2xl font-bold text-green-600">{stats.healthyChecks}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">Reboots</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.rebootsTriggered}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">Alertes Support</p>
                  <p className="text-2xl font-bold text-red-600">{stats.supportNotifications}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">Uptime (24h)</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.uptime}%</p>
                </div>
              </div>
            )}

            {/* Support Contacts */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📱 Contacts Support
              </h2>
              <div className="space-y-2">
                {contacts.length === 0 ? (
                  <p className="text-gray-500">Aucun contact configuré</p>
                ) : (
                  contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {contact.contact_type === 'primary' ? '👤' : '👥'}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">{contact.full_name}</p>
                          <p className="text-sm text-gray-600">{contact.phone_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          contact.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {contact.is_active ? 'Actif' : 'Inactif'}
                        </span>
                        <span className="text-sm text-gray-500">
                          Priorité {contact.notification_priority}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Health Logs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📋 Historique des Checks (50 derniers)
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date/Heure
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        État Instance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Reboot
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Support
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Temps (ms)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Erreur
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                          Aucun log disponible
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(log.checked_at).toLocaleString('fr-FR')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              log.trigger_type === 'automatic' ? 'bg-blue-50 text-blue-700' :
                              log.trigger_type === 'manual' ? 'bg-purple-50 text-purple-700' :
                              log.trigger_type === 'scheduled' ? 'bg-orange-50 text-orange-700' :
                              'bg-gray-50 text-gray-700'
                            }`}>
                              {log.trigger_type === 'automatic' ? '🤖 Auto' :
                               log.trigger_type === 'manual' ? '👤 Manuel' :
                               log.trigger_type === 'scheduled' ? '⏰ Planifié' :
                               '❓'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                              {getStatusIcon(log.status)} {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {log.state_instance || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {log.reboot_triggered ? (
                              <span className={log.reboot_success ? 'text-green-600' : 'text-red-600'}>
                                {log.reboot_success ? '✅ OK' : '❌ Échoué'}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {log.support_notified ? (
                              <span className="text-red-600 font-semibold">🚨 Oui</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {log.response_time_ms || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-600 max-w-xs truncate">
                            {log.error_message || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Tab Content: Scheduled Reboot */}
        {activeTab === 'scheduled' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              🔄 Configuration Reboot Planifié Quotidien
            </h2>

            {configSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800">✅ {configSuccess}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rebootConfig.is_enabled}
                      onChange={(e) => setRebootConfig({
                        ...rebootConfig,
                        is_enabled: e.target.checked
                      })}
                      className="sr-only"
                    />
                    <div className={`w-14 h-8 rounded-full transition-colors ${
                      rebootConfig.is_enabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        rebootConfig.is_enabled ? 'transform translate-x-6' : ''
                      }`}></div>
                    </div>
                  </div>
                  <span className="text-lg font-semibold">
                    {rebootConfig.is_enabled ? '✅ Activé' : '⭕ Désactivé'}
                  </span>
                </label>
              </div>

              {/* Time Picker */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⏰ Heure du reboot quotidien
                </label>
                <input
                  type="time"
                  value={rebootConfig.scheduled_time.substring(0, 5)}
                  onChange={(e) => setRebootConfig({
                    ...rebootConfig,
                    scheduled_time: e.target.value + ':00'
                  })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  🌍 Fuseau horaire: {rebootConfig.timezone}
                </p>
              </div>

              {/* Info Section */}
              {rebootConfig.is_enabled && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📅 <strong>Prochain reboot prévu:</strong> {rebootConfig.scheduled_time.substring(0, 5)} ({rebootConfig.timezone})
                  </p>
                  {rebootConfig.last_executed_at && (
                    <p className="text-sm text-blue-700 mt-2">
                      🕒 <strong>Dernier reboot:</strong> {new Date(rebootConfig.last_executed_at).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={saveRebootConfig}
                disabled={savingConfig}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {savingConfig ? 'Sauvegarde...' : '💾 Sauvegarder la Configuration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}