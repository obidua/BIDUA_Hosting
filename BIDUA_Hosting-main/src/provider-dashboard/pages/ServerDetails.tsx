import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Server, MapPin, Calendar, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { ProviderHeader } from '../components/ProviderHeader';
import { StatusBadge } from '../components/StatusBadge';
import providerApi, { ServerDetails as ServerDetailsData, RenewResponse } from '../../lib/provider-api';

export function ServerDetails() {
  const { serverId } = useParams<{ serverId: string }>();
  const navigate = useNavigate();
  const [server, setServer] = useState<ServerDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renewing, setRenewing] = useState(false);
  const [renewSuccess, setRenewSuccess] = useState<string | null>(null);

  const fetchServer = async () => {
    if (!serverId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await providerApi.getServerDetails(serverId);
      setServer(data);
    } catch (err) {
      console.error('Failed to fetch server details:', err);
      setError('Failed to load server details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!serverId) return;
    try {
      setRenewing(true);
      setError(null);
      const response = await providerApi.renewServer(serverId, 1);
      setRenewSuccess(`Server renewed successfully. New expiry date: ${new Date(response.newExpiryDate).toLocaleDateString()}`);
      // Refresh server data
      setTimeout(() => fetchServer(), 1000);
    } catch (err) {
      console.error('Failed to renew server:', err);
      setError('Failed to renew server. Please try again.');
    } finally {
      setRenewing(false);
    }
  };

  useEffect(() => {
    fetchServer();
  }, [serverId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-400">Loading server details...</div>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Server not found</p>
          <button
            onClick={() => navigate('/provider/servers')}
            className="text-cyan-400 hover:text-cyan-300"
          >
            Back to Servers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <button
        onClick={() => navigate('/provider/servers')}
        className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Servers</span>
      </button>

      <div className="flex items-center justify-between mb-8">
        <ProviderHeader
          title={server.name}
          description={`Server ID: ${server.id}`}
        />
        <button
          onClick={fetchServer}
          disabled={loading || renewing}
          className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-300 disabled:opacity-50"
          title="Refresh server details"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {renewSuccess && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
          {renewSuccess}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Status</h3>
              <StatusBadge status={server.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">IP Address</p>
                <p className="text-white font-mono">{server.ipAddress}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Region</p>
                <p className="text-white">{server.region}</p>
              </div>
            </div>
          </div>

          {/* Server Specifications */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Server Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">CPU</p>
                <p className="text-white font-medium">{server.specs.cpu}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Memory</p>
                <p className="text-white font-medium">{server.specs.memory}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Storage</p>
                <p className="text-white font-medium">{server.specs.storage}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Bandwidth</p>
                <p className="text-white font-medium">{server.specs.bandwidth}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 text-sm">Created</p>
                  <p className="text-white">{new Date(server.createdDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 text-sm">Last Maintenance</p>
                  <p className="text-white">{new Date(server.lastMaintenance).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 text-sm">Expiry Date</p>
                  <p className="text-white">{new Date(server.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Expiry Alert */}
          {server.daysUntilExpiry < 90 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-orange-400 font-semibold mb-1">Renewal Due Soon</h4>
                  <p className="text-orange-200 text-sm">
                    {server.daysUntilExpiry} days remaining until expiry
                  </p>
                  <button className="mt-3 px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition">
                    Renew Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Renewal Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h4 className="text-white font-semibold mb-4">Renewal Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Monthly Cost</span>
                <span className="text-white font-medium">${server.costPerMonth}</span>
              </div>
              <div className="border-t border-slate-700 pt-3">
                <p className="text-slate-400 text-sm mb-2">Status</p>
                <div className="flex items-center gap-2">
                  {server.renewalStatus === 'confirmed' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                  )}
                  <span className="text-white capitalize">{server.renewalStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h4 className="text-white font-semibold mb-4">Quick Actions</h4>
            <div className="space-y-2">
              <button
                onClick={handleRenew}
                disabled={renewing}
                className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {renewing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Renewing...
                  </>
                ) : (
                  'Renew Server'
                )}
              </button>
              <button className="w-full px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition text-sm font-medium">
                Edit Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
