'use client';

import { useState, useEffect } from 'react';

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

export default function GreenAPIHealthPage() {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // Rafraîchir toutes les minutes
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const response = await fetch('/api/green-api-health');
      if (!response.ok) throw new Error('Erreur chargement données');

      const data = await response.json();
      setLogs(data.logs || []);
      setContacts(data.contacts || []);
      setStats(data.stats || null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function triggerManualCheck() {
    try {
      setLoading(true);
      const response = await fetch('/api/green-api-health/manual-check', {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Erreur déclenchement check');

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
                Surveillance automatique toutes les 15 minutes • Environnement DEV
              </p>
            </div>
            <button
              onClick={triggerManualCheck}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Vérification...' : '🔄 Check Manuel'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

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
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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
      </div>
    </div>
  );
}