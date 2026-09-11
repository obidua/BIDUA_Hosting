import React from 'react';
import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  color?: 'blue' | 'green' | 'orange' | 'cyan' | 'red';
}

export function StatCard({ title, value, icon: Icon, trend, color = 'cyan' }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    green: 'text-green-400 bg-green-500/10 border-green-500/30',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    red: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const isTrendPositive = trend && trend > 0;

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-slate-300 text-sm font-medium">{title}</h3>
        <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[0]}`} />
      </div>
      
      <div className="mb-4">
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>

      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-sm ${isTrendPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isTrendPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{Math.abs(trend)}% vs last month</span>
        </div>
      )}
    </div>
  );
}
