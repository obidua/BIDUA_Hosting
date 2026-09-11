import React, { useState, useEffect } from 'react';
import { Server, Search, Filter, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { ProviderHeader } from '../components/ProviderHeader';
import { ServerTable } from '../components/ServerTable';
import { FilterPanel } from '../components/FilterPanel';
import { BulkActionsBar } from '../components/BulkActionsBar';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import providerApi, { Server as ServerData } from '../../lib/provider-api';

export function ServersList() {
  const [servers, setServers] = useState<ServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [exporting, setExporting] = useState(false);
  const [selectedServers, setSelectedServers] = useState<Set<string>>(new Set());
  const [renewingBulk, setRenewingBulk] = useState(false);
  const { toasts, removeToast, success, error: errorToast, warning } = useToast();

  const fetchServers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await providerApi.getServers({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        location: filterLocation !== 'all' ? filterLocation : undefined,
        search: searchTerm || undefined,
      });
      setServers(data);
    } catch (err) {
      console.error('Failed to fetch servers:', err);
      setError('Failed to load servers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, [filterStatus, filterLocation]);

  const filteredServers = searchTerm
    ? servers.filter(server => {
        return (
          server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          server.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : servers;

  const handleSelectServer = (serverId: string, checked: boolean) => {
    const newSelected = new Set(selectedServers);
    if (checked) {
      newSelected.add(serverId);
    } else {
      newSelected.delete(serverId);
    }
    setSelectedServers(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedServers(new Set(filteredServers.map(s => s.id)));
    } else {
      setSelectedServers(new Set());
    }
  };

  const handleBulkRenew = async () => {
    if (selectedServers.size === 0) return;
    
    try {
      setRenewingBulk(true);
      setError(null);
      const result = await providerApi.bulkRenewServers(Array.from(selectedServers), 1);
      
      if (result.success > 0) {
        success('Bulk Renewal', `Successfully renewed ${result.success} server${result.success !== 1 ? 's' : ''}`);
        setSelectedServers(new Set());
        // Refresh the list
        setTimeout(() => fetchServers(), 1000);
      }
      
      if (result.failed > 0) {
        if (result.success > 0) {
          warning('Partial Success', `${result.failed} server${result.failed !== 1 ? 's' : ''} failed to renew`);
        } else {
          errorToast('Renewal Failed', 'Failed to renew servers. Please try again.');
        }
      }
    } catch (err) {
      console.error('Failed to bulk renew:', err);
      errorToast('Error', 'Failed to renew servers. Please try again.');
    } finally {
      setRenewingBulk(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await providerApi.exportServers('csv', {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        location: filterLocation !== 'all' ? filterLocation : undefined,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `servers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      success('Export Complete', 'Servers list downloaded successfully');
    } catch (err) {
      console.error('Failed to export:', err);
      errorToast('Export Failed', 'Failed to export servers');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-400">Loading servers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <ProviderHeader
          title="Servers"
          description="Manage and monitor your server infrastructure"
        />
        <button
          onClick={fetchServers}
          disabled={loading}
          className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-300 disabled:opacity-50"
          title="Refresh servers"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search servers by name or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || !servers || servers.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:border-cyan-500/50 transition disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>{exporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>

        <FilterPanel
          onStatusChange={setFilterStatus}
          onLocationChange={setFilterLocation}
          selectedStatus={filterStatus}
          selectedLocation={filterLocation}
        />
      </div>

      {/* Servers Table */}
      <div className="mt-8">
        <ServerTable
          servers={filteredServers}
          selectedServers={selectedServers}
          onSelectServer={handleSelectServer}
          onSelectAll={handleSelectAll}
          showCheckboxes={true}
        />
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedServers.size}
        onRenewSelected={handleBulkRenew}
        onClearSelection={() => setSelectedServers(new Set())}
        isLoading={renewingBulk}
      />

      {/* Empty State */}
      {filteredServers.length === 0 && (
        <div className="mt-12 text-center py-12">
          <Server className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400">No servers found matching your criteria</p>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
