import React from 'react';
import { CheckCircle, Loader, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'active' | 'provisioning' | 'suspended' | 'expired';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    active: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      icon: CheckCircle,
      label: 'Active',
    },
    provisioning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      icon: Loader,
      label: 'Provisioning',
    },
    suspended: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      icon: AlertCircle,
      label: 'Suspended',
    },
    expired: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: XCircle,
      label: 'Expired',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${config.bg} border ${config.border}`}>
      <Icon className={`w-4 h-4 ${config.text}`} />
      <span className={config.text}>{config.label}</span>
    </div>
  );
}
