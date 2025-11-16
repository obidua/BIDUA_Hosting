import { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  RefreshCw,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  Mail,
  Phone,
  Package
} from 'lucide-react';
import api from '../../lib/api';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';

interface Subscription {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  plan_name: string;
  status: 'active' | 'inactive' | 'pending' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string;
  next_renewal: string;
  amount: number;
  billing_cycle: string;
  auto_renewal: boolean;
  created_at: string;
  updated_at: string;
}

interface SubscriptionStats {
  total_subscriptions: number;
  active_subscriptions: number;
  pending_subscriptions: number;
  expired_subscriptions: number;
  total_recurring_revenue: number;
  expiring_soon: number;
}

export function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const [subsResponse, statsResponse] = await Promise.all([
        api.request(`/api/v1/admin/subscriptions?${params}`, { method: 'GET' }),
        api.request('/api/v1/admin/subscriptions/stats', { method: 'GET' })
      ]);

      setSubscriptions(Array.isArray(subsResponse) ? subsResponse : []);
      setStats(statsResponse || null);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (subscriptionId: number) => {
    if (!confirm('Manually renew this subscription?')) return;
    try {
      await api.request(`/api/v1/admin/subscriptions/${subscriptionId}/renew`, {
        method: 'POST',
      });
      alert('Subscription renewed successfully');
      await fetchData();
    } catch (error) {
      console.error('Error renewing subscription:', error);
      alert('Failed to renew subscription');
    }
  };

  const handleCancel = async (subscriptionId: number) => {
    if (!confirm('Cancel this subscription? This action cannot be undone.')) return;
    try {
      await api.request(`/api/v1/admin/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'cancelled' }),
      });
      alert('Subscription cancelled successfully');
      await fetchData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    (sub.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     sub.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     sub.plan_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40';
      case 'pending':
        return 'bg-amber-500/15 text-amber-200 border-amber-500/40';
      case 'expired':
      case 'cancelled':
        return 'bg-rose-500/15 text-rose-200 border-rose-500/40';
      case 'inactive':
        return 'bg-slate-500/15 text-slate-200 border-slate-500/40';
      default:
        return 'bg-slate-500/15 text-slate-200 border-slate-500/40';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'expired':
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Subscription Management"
        description="Monitor and manage all active subscriptions, renewals, and customer billing cycles."
        actions={
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 hover:bg-slate-900/70 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <p className="text-sm text-slate-400">Total Subscriptions</p>
            <p className="text-2xl font-bold text-white">{stats.total_subscriptions}</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <p className="text-sm text-slate-400">Active</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.active_subscriptions}</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <p className="text-sm text-slate-400">Pending</p>
            <p className="text-2xl font-bold text-amber-400">{stats.pending_subscriptions}</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <p className="text-sm text-slate-400">Expiring Soon</p>
            <p className="text-2xl font-bold text-rose-400">{stats.expiring_soon}</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <p className="text-sm text-slate-400">Monthly Revenue</p>
            <p className="text-xl font-bold text-cyan-300">{formatCurrency(stats.total_recurring_revenue)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by user, email, or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Subscriptions</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-slate-950/60 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Plan</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Renewal Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Auto-Renew</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-900/40 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-white">{sub.user_name}</p>
                      <p className="text-sm text-slate-400">{sub.user_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{sub.plan_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(sub.status)}`}>
                      {getStatusIcon(sub.status)}
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-cyan-300 font-medium">{formatCurrency(sub.amount)}</td>
                  <td className="px-6 py-4 text-slate-300">{formatDate(sub.next_renewal)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                      sub.auto_renewal
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                        : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                    }`}>
                      {sub.auto_renewal ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedSubscription(sub);
                          setShowDetails(true);
                        }}
                        className="px-3 py-1 text-cyan-300 hover:bg-cyan-500/10 rounded text-sm"
                      >
                        View
                      </button>
                      {sub.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleRenew(sub.id)}
                            className="px-3 py-1 text-emerald-300 hover:bg-emerald-500/10 rounded text-sm"
                          >
                            Renew
                          </button>
                          <button
                            onClick={() => handleCancel(sub.id)}
                            className="px-3 py-1 text-rose-400 hover:bg-rose-500/10 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <CreditCard className="h-10 w-10 mx-auto mb-4 text-slate-500" />
            <p>No subscriptions found</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedSubscription && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-900 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-white">Subscription Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Customer Info */}
              <div className="space-y-4 border-b border-slate-800 pb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5" /> Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Name</p>
                    <p className="text-white font-medium">{selectedSubscription.user_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Email</p>
                    <p className="text-cyan-300">{selectedSubscription.user_email}</p>
                  </div>
                </div>
              </div>

              {/* Plan Info */}
              <div className="space-y-4 border-b border-slate-800 pb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Package className="w-5 h-5" /> Plan Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Plan Name</p>
                    <p className="text-white font-medium">{selectedSubscription.plan_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Billing Cycle</p>
                    <p className="text-white font-medium">{selectedSubscription.billing_cycle}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Amount</p>
                    <p className="text-cyan-300 font-bold">{formatCurrency(selectedSubscription.amount)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Auto-Renewal</p>
                    <p className={selectedSubscription.auto_renewal ? 'text-emerald-300' : 'text-slate-400'}>
                      {selectedSubscription.auto_renewal ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4 border-b border-slate-800 pb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Dates
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Start Date</p>
                    <p className="text-white">{formatDate(selectedSubscription.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">End Date</p>
                    <p className="text-white">{formatDate(selectedSubscription.end_date)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Next Renewal</p>
                    <p className="text-cyan-300">{formatDate(selectedSubscription.next_renewal)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Status</p>
                    <p className={`inline-flex items-center gap-1 ${
                      selectedSubscription.status === 'active' ? 'text-emerald-300' :
                      selectedSubscription.status === 'pending' ? 'text-amber-300' :
                      'text-rose-300'
                    }`}>
                      {selectedSubscription.status.charAt(0).toUpperCase() + selectedSubscription.status.slice(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-900"
                >
                  Close
                </button>
                {selectedSubscription.status === 'active' && (
                  <>
                    <button
                      onClick={() => {
                        handleRenew(selectedSubscription.id);
                        setShowDetails(false);
                      }}
                      className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 border border-emerald-500/40"
                    >
                      Renew Now
                    </button>
                    <button
                      onClick={() => {
                        handleCancel(selectedSubscription.id);
                        setShowDetails(false);
                      }}
                      className="px-4 py-2 bg-rose-500/20 text-rose-300 rounded-lg hover:bg-rose-500/30 border border-rose-500/40"
                    >
                      Cancel Subscription
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
