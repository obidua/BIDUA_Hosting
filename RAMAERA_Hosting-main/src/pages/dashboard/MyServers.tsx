import { Server, Power, PowerOff, RefreshCw, Settings, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface ServerData {
  id: number;
  name: string;
  hostname: string;
  status: string;
  ip_address?: string;
  plan_name?: string;
  vcpu?: number;
  ram?: number;
  storage?: number;
  os?: string;
  created_at?: string;
  expires_at?: string;
}

export function MyServers() {
  const [servers, setServers] = useState<ServerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      setLoading(true);
      const response = await api.getServers();
      const serversArray: ServerData[] = Array.isArray(response) ? response : (response as { servers?: ServerData[] })?.servers || [];
      setServers(serversArray);
    } catch (error) {
      console.error('Failed to load servers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      stopped: 'bg-slate-800 text-slate-300',
      provisioning: 'bg-blue-100 text-blue-700',
      error: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || colors.stopped;
  };

  return (
    <div className="space-y-6 w-full h-full overflow-y-auto pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-2 sm:px-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">My Servers</h2>
          <p className="text-sm sm:text-base text-slate-400">Manage and monitor all your servers</p>
        </div>
        <Link
          to="/pricing"
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-semibold border-2 border-cyan-500 text-center text-sm sm:text-base"
        >
          Deploy New Server
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">
          <p>Loading servers...</p>
        </div>
      ) : servers.length === 0 ? (
        <div className="bg-slate-900 rounded-xl shadow-sm border-2 border-cyan-500 p-8 text-center">
          <Server className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Servers Yet</h3>
          <p className="text-slate-400 mb-6">Deploy your first server to get started</p>
          <Link
            to="/pricing"
            className="inline-block px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-semibold border-2 border-cyan-500"
          >
            View Plans
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 px-2 sm:px-0">
          {servers.map((server) => (
            <div key={server.id} className="bg-slate-900 rounded-xl shadow-sm border-2 border-cyan-500 overflow-hidden hover:shadow-lg hover:shadow-cyan-500/30 transition">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Server className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1 truncate">{server.name}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 mb-2 truncate">{server.hostname}</p>
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(server.status)}`}>
                        {server.status}
                      </span>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-cyan-400 self-start">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6 bg-slate-950 p-3 sm:p-4 rounded-lg border-2 border-cyan-500/50">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Plan</p>
                    <p className="text-sm sm:text-base font-semibold text-white truncate">{server.plan_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">IP Address</p>
                    <p className="text-sm sm:text-base font-semibold text-white truncate">{server.ip_address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Resources</p>
                    <p className="text-sm sm:text-base font-semibold text-white">{server.vcpu || 0} vCPU, {server.ram || 0}GB</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Storage</p>
                    <p className="text-sm sm:text-base font-semibold text-white">{server.storage || 0}GB NVMe</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs text-slate-400 mb-1">OS</p>
                    <p className="text-sm sm:text-base font-semibold text-white truncate">{server.os || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-cyan-500">
                  <div className="text-xs sm:text-sm text-slate-400">
                    {server.created_at && (
                      <>
                        Created: {new Date(server.created_at).toLocaleDateString()}
                        {server.expires_at && (
                          <>
                            {' • '}
                            Expires: {new Date(server.expires_at).toLocaleDateString()}
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {server.status === 'active' ? (
                      <button className="px-3 sm:px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition font-semibold flex items-center space-x-2 text-xs sm:text-sm">
                        <PowerOff className="h-4 w-4" />
                        <span className="hidden sm:inline">Stop</span>
                      </button>
                    ) : (
                      <button className="px-3 sm:px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition font-semibold flex items-center space-x-2 text-xs sm:text-sm">
                        <Power className="h-4 w-4" />
                        <span className="hidden sm:inline">Start</span>
                      </button>
                    )}
                    <button className="px-3 sm:px-4 py-2 bg-slate-800 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700 transition font-semibold flex items-center space-x-2 text-xs sm:text-sm">
                      <RefreshCw className="h-4 w-4" />
                      <span className="hidden sm:inline">Reboot</span>
                    </button>
                    <Link
                      to={`/dashboard/servers/${server.id}`}
                      className="px-3 sm:px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-semibold flex items-center space-x-2 border-2 border-cyan-500 text-xs sm:text-sm"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Manage</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
