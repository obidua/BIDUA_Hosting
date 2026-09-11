import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface ExpiryItem {
  id: string;
  serverName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  urgency: 'critical' | 'warning' | 'caution' | 'safe';
  renewalStatus: 'pending' | 'confirmed' | 'expired';
}

interface ExpiryAlertProps {
  item: ExpiryItem;
}

export function ExpiryAlert({ item }: ExpiryAlertProps) {
  const urgencyConfig = {
    critical: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: AlertTriangle,
      label: 'Critical',
    },
    warning: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      icon: AlertCircle,
      label: 'Warning',
    },
    caution: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      icon: AlertCircle,
      label: 'Caution',
    },
    safe: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      icon: CheckCircle,
      label: 'Safe',
    },
  };

  const config = urgencyConfig[item.urgency];
  const Icon = config.icon;

  const renewalIcon = item.renewalStatus === 'confirmed' ? CheckCircle : AlertCircle;
  const renewalColor = item.renewalStatus === 'confirmed' ? 'text-green-400' : 'text-orange-400';

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-6`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Icon className={`w-5 h-5 ${config.text}`} />
            <h3 className="text-lg font-semibold text-white">{item.serverName}</h3>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${config.bg} border ${config.border} ${config.text}`}>
              {config.label}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Days Until Expiry</p>
              <p className={`text-2xl font-bold ${config.text}`}>{item.daysUntilExpiry}</p>
            </div>
            
            <div>
              <p className="text-slate-400 text-sm mb-1">Expiry Date</p>
              <p className="text-white font-medium">{new Date(item.expiryDate).toLocaleDateString()}</p>
            </div>
            
            <div>
              <p className="text-slate-400 text-sm mb-1">Renewal Status</p>
              <div className="flex items-center gap-2">
                {React.createElement(renewalIcon, { className: `w-5 h-5 ${renewalColor}` })}
                <span className="text-white capitalize font-medium">{item.renewalStatus}</span>
              </div>
            </div>
          </div>

          {item.urgency !== 'safe' && (
            <div className="mt-4">
              <button className={`px-4 py-2 ${config.text} hover:opacity-80 transition text-sm font-medium border rounded-lg ${config.border}`}>
                Renew Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
