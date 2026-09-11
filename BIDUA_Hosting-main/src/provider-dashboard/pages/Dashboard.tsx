import React, { useState, useEffect } from 'react';
import { Server, Clock, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { ProviderHeader } from '../components/ProviderHeader';
import providerApi, { DashboardStats } from '../../lib/provider-api';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalServers: 0,
    activeServers: 0,
    expiringoon: 0,
    renewalRevenue: 0,
    monthlyRecurring: 0,
    serversByStatus: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await providerApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to load dashboard stats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <ProviderHeader
            title="Dashboard"
            description="Overview of your server infrastructure and operational metrics"
          />
        </div>
        <button
          onClick={fetchStats}
          className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-300"
          title="Refresh dashboard"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <StatCard
          title="Total Servers"
          value={stats.totalServers}
          icon={Server}
          trend={3.2}
          color="blue"
        />
        <StatCard
          title="Active Servers"
          value={stats.activeServers}
          icon={Server}
          trend={1.5}
          color="green"
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringoon || 0}
          icon={Clock}
          trend={-2.1}
          color="orange"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats.monthlyRecurring || 0).toLocaleString()}`}
          icon={TrendingUp}
          trend={8.5}
          color="cyan"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-cyan-500/50 transition cursor-pointer">
          <AlertCircle className="w-8 h-8 text-orange-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Expiring Soon</h3>
          <p className="text-slate-400 text-sm mb-4">
            {stats.expiringoon} servers expiring in the next 30 days
          </p>
          <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
            Review Expirations →
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-cyan-500/50 transition cursor-pointer">
          <Server className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Server Inventory</h3>
          <p className="text-slate-400 text-sm mb-4">
            {stats.activeServers} out of {stats.totalServers} servers active
          </p>
          <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
            View Servers →
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-cyan-500/50 transition cursor-pointer">
          <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Revenue</h3>
          <p className="text-slate-400 text-sm mb-4">
            Monthly recurring: ${stats.monthlyRecurring.toLocaleString()}
          </p>
          <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
            View Revenue →
          </button>
        </div>
      </div>
    </div>
  );
}
