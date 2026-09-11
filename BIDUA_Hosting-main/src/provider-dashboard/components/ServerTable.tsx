import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface ServerData {
  id: string;
  name: string;
  status: 'active' | 'provisioning' | 'suspended' | 'expired';
  ipAddress: string;
  location: string;
  expiryDate: string;
  daysUntilExpiry: number;
}

interface ServerTableProps {
  servers: ServerData[];
  selectedServers?: Set<string>;
  onSelectServer?: (serverId: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  showCheckboxes?: boolean;
}

export function ServerTable({
  servers,
  selectedServers = new Set(),
  onSelectServer,
  onSelectAll,
  showCheckboxes = false,
}: ServerTableProps) {
  const allSelected = servers.length > 0 && servers.every(s => selectedServers.has(s.id));
  const someSelected = servers.some(s => selectedServers.has(s.id)) && !allSelected;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/50">
              {showCheckboxes && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Server Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Expires In
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {servers.map(server => (
              <tr key={server.id} className="hover:bg-slate-800/50 transition">
                {showCheckboxes && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedServers.has(server.id)}
                      onChange={(e) => onSelectServer?.(server.id, e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                    />
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-white font-medium">{server.name}</td>
                <td className="px-6 py-4 text-sm text-slate-300 font-mono">{server.ipAddress}</td>
                <td className="px-6 py-4 text-sm text-slate-300">{server.location}</td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={server.status} />
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-white">{server.daysUntilExpiry} days</span>
                    <span className="text-xs text-slate-400">
                      ({new Date(server.expiryDate).toLocaleDateString()})
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/provider/servers/${server.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1 text-cyan-400 hover:text-cyan-300 transition text-sm"
                  >
                    View
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
