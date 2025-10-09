import { useState, useEffect } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { getMyEarnings, formatCurrency, getStatusColor } from '../../lib/referral';
import { ReferralEarning } from '../../types';

export function ReferralEarningsTab() {
  const [earnings, setEarnings] = useState<ReferralEarning[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const data = await getMyEarnings(100, 0);
      setEarnings(data.earnings);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading earnings...</div>;
  }

  if (earnings.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="h-16 w-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Earnings Yet</h3>
        <p className="text-slate-400">Start referring customers to earn commissions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Earnings History</h3>
        <div className="text-sm text-slate-400">{total} total earnings</div>
      </div>

      <div className="space-y-3">
        {earnings.map((earning) => (
          <div
            key={earning.id}
            className="bg-slate-800 rounded-lg p-4 border border-cyan-500/30 hover:border-cyan-500/50 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-white">
                    {earning.referred_user?.full_name || 'Unknown User'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(earning.status)}`}>
                    {earning.status}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full text-xs font-semibold">
                    Level {earning.referral_level}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(earning.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="capitalize">{earning.billing_type}</span>
                  {earning.renewal_cycle > 0 && (
                    <span className="text-cyan-400">Renewal #{earning.renewal_cycle}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-400">
                  {formatCurrency(earning.commission_amount)}
                </div>
                <div className="text-xs text-slate-400">
                  {earning.commission_rate}% of {formatCurrency(earning.order_amount)}
                </div>
              </div>
            </div>

            {earning.approved_at && (
              <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700">
                Approved: {new Date(earning.approved_at).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
