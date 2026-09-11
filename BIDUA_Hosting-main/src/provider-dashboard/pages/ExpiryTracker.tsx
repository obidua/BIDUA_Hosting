import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { ProviderHeader } from '../components/ProviderHeader';
import { ExpiryAlert } from '../components/ExpiryAlert';
import providerApi, { ExpiryItem } from '../../lib/provider-api';

export function ExpiryTracker() {
  const [expiryData, setExpiryData] = useState<ExpiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<string>('all');

  const fetchExpiryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await providerApi.getExpiryTracker({
        urgency: filterUrgency !== 'all' ? filterUrgency : undefined,
      });
      setExpiryData(data);
    } catch (err) {
      console.error('Failed to fetch expiry tracker:', err);
      setError('Failed to load expiry data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiryData();
  }, [filterUrgency]);

  const filteredItems = filterUrgency === 'all'
    ? expiryData
    : expiryData.filter(item => item.urgency === filterUrgency);

  // Calculate stats from the data
  const stats = {
    critical: expiryData.filter(item => item.urgency === 'critical').length,
    warning: expiryData.filter(item => item.urgency === 'warning').length,
    caution: expiryData.filter(item => item.urgency === 'caution').length,
    safe: expiryData.filter(item => item.urgency === 'safe').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-400">Loading expiry data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <ProviderHeader
          title="Expiry Tracker"
          description="Monitor server renewal dates and pending expirations"
        />
        <button
          onClick={fetchExpiryData}
          disabled={loading}
          className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-300 disabled:opacity-50"
          title="Refresh expiry data"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm font-medium">Critical</p>
          <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
          <p className="text-red-300/60 text-xs mt-1">0-7 days</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <p className="text-orange-400 text-sm font-medium">Warning</p>
          <p className="text-2xl font-bold text-orange-400">{stats.warning}</p>
          <p className="text-orange-300/60 text-xs mt-1">8-30 days</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-400 text-sm font-medium">Caution</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.caution}</p>
          <p className="text-yellow-300/60 text-xs mt-1">31-90 days</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-400 text-sm font-medium">Safe</p>
          <p className="text-2xl font-bold text-green-400">{stats.safe}</p>
          <p className="text-green-300/60 text-xs mt-1">&gt;90 days</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mt-8 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterUrgency('all')}
          className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
            filterUrgency === 'all'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterUrgency('critical')}
          className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
            filterUrgency === 'critical'
              ? 'bg-red-500 text-white'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Critical
        </button>
        <button
          onClick={() => setFilterUrgency('warning')}
          className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
            filterUrgency === 'warning'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Warning
        </button>
        <button
          onClick={() => setFilterUrgency('caution')}
          className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
            filterUrgency === 'caution'
              ? 'bg-yellow-500 text-white'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Caution
        </button>
        <button
          onClick={() => setFilterUrgency('safe')}
          className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
            filterUrgency === 'safe'
              ? 'bg-green-500 text-white'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Safe
        </button>
      </div>

      {/* Expiry Items */}
      <div className="mt-8 space-y-4">
        {filteredItems.map(item => (
          <ExpiryAlert key={item.id} item={item} />
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="mt-12 text-center py-12">
          <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400">No servers in this urgency category</p>
        </div>
      )}
    </div>
  );
}
