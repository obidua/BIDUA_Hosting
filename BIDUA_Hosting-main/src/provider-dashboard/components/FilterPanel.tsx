import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  onStatusChange: (status: string) => void;
  onLocationChange: (location: string) => void;
  selectedStatus: string;
  selectedLocation: string;
}

export function FilterPanel({
  onStatusChange,
  onLocationChange,
  selectedStatus,
  selectedLocation,
}: FilterPanelProps) {
  const statuses = ['all', 'active', 'provisioning', 'suspended', 'expired'];
  const locations = ['all', 'US-East', 'US-West', 'EU-Central', 'APAC', 'Canada'];

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Status Filter */}
      <div className="flex-1">
        <label className="block text-sm text-slate-400 mb-2">Status</label>
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
          }}
        >
          {statuses.map(status => (
            <option key={status} value={status} className="bg-slate-900">
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div className="flex-1">
        <label className="block text-sm text-slate-400 mb-2">Location</label>
        <select
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
          }}
        >
          {locations.map(location => (
            <option key={location} value={location} className="bg-slate-900">
              {location.charAt(0).toUpperCase() + location.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      {(selectedStatus !== 'all' || selectedLocation !== 'all') && (
        <div className="flex items-end">
          <button
            onClick={() => {
              onStatusChange('all');
              onLocationChange('all');
            }}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
