import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Globe
} from 'lucide-react';
import api from '../../lib/api';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';

interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  country?: string;
  city?: string;
  account_status: string;
  is_affiliate: boolean;
  affiliate_earnings: number;
  total_spent: number;
  active_subscriptions: number;
  total_servers: number;
  created_at: string;
  last_login?: string;
}

interface UserDetailData {
  user: User;
  subscriptions: any[];
  servers: any[];
  orders: any[];
  invoices: any[];
  affiliate_stats?: {
    referrals_count: number;
    earned_commission: number;
    pending_payout: number;
  };
}

export function UserAnalytics() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserDetailData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await api.request(`/api/v1/admin/users?${params}`, { method: 'GET' });
      setUsers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (userId: number) => {
    try {
      const response = await api.request(`/api/v1/admin/users/${userId}/full-profile`, {
        method: 'GET'
      });
      setSelectedUser(response);
      setShowDetails(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      alert('Failed to load user details');
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    if (!confirm(`Change user account status to ${newStatus}?`)) return;
    try {
      await api.request(`/api/v1/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ account_status: newStatus }),
      });
      alert('User status updated');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user =>
    (user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || user.account_status === statusFilter)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40';
      case 'suspended':
        return 'bg-rose-500/15 text-rose-200 border-rose-500/40';
      case 'pending':
        return 'bg-amber-500/15 text-amber-200 border-amber-500/40';
      default:
        return 'bg-slate-500/15 text-slate-200 border-slate-500/40';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.account_status === 'active').length,
    affiliates: users.filter(u => u.is_affiliate).length,
    totalRevenue: users.reduce((sum, u) => sum + u.total_spent, 0),
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Analytics & Management"
        description="View and manage all users with their subscription status, purchase history, and affiliate information."
        actions={
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 hover:bg-slate-900/70 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p className="text-sm text-slate-400">Total Users</p>
          <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p className="text-sm text-slate-400">Active Users</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.activeUsers}</p>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p className="text-sm text-slate-400">Affiliates</p>
          <p className="text-2xl font-bold text-cyan-400">{stats.affiliates}</p>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p className="text-sm text-slate-400">Total Revenue</p>
          <p className="text-lg font-bold text-yellow-400">{formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
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
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-950/60 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Subscriptions</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Servers</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Total Spent</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Affiliate</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-900/40 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-white">{user.full_name}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                      {user.country && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Globe className="w-3 h-3" /> {user.country}
                          {user.city && `, ${user.city}`}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(user.account_status)}`}>
                      {user.account_status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {user.account_status === 'suspended' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {user.account_status.charAt(0).toUpperCase() + user.account_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span className="text-white font-medium">{user.active_subscriptions}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="text-white font-medium">{user.total_servers}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-cyan-300 font-medium">{formatCurrency(user.total_spent)}</td>
                  <td className="px-6 py-4">
                    {user.is_affiliate ? (
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-1 text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-500/40 rounded-full">
                          Yes
                        </span>
                        <p className="text-xs text-slate-400">{formatCurrency(user.affiliate_earnings)}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => loadUserDetails(user.id)}
                      className="px-3 py-1 text-cyan-300 hover:bg-cyan-500/10 rounded text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Users className="h-10 w-10 mx-auto mb-4 text-slate-500" />
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-900 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedUser.user.full_name}</h2>
                  <p className="text-slate-400">{selectedUser.user.email}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* User Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-800 pb-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Account Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedUser.user.account_status)}`}>
                    {selectedUser.user.account_status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Active Subscriptions</p>
                  <p className="text-lg font-bold text-white">{selectedUser.user.active_subscriptions}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Servers</p>
                  <p className="text-lg font-bold text-white">{selectedUser.user.total_servers}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Spent</p>
                  <p className="text-lg font-bold text-cyan-300">{formatCurrency(selectedUser.user.total_spent)}</p>
                </div>
              </div>

              {/* Contact & Location */}
              <div className="space-y-4 border-b border-slate-800 pb-4">
                <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <p className="text-slate-400">Email</p>
                      <p className="text-white">{selectedUser.user.email}</p>
                    </div>
                  </div>
                  {selectedUser.user.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-slate-400 mt-1" />
                      <div>
                        <p className="text-slate-400">Phone</p>
                        <p className="text-white">{selectedUser.user.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedUser.user.country && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                      <div>
                        <p className="text-slate-400">Location</p>
                        <p className="text-white">
                          {selectedUser.user.city ? `${selectedUser.user.city}, ${selectedUser.user.country}` : selectedUser.user.country}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscriptions */}
              {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 && (
                <div className="space-y-4 border-b border-slate-800 pb-4">
                  <h3 className="text-lg font-semibold text-white">Active Subscriptions ({selectedUser.subscriptions.length})</h3>
                  <div className="space-y-2">
                    {selectedUser.subscriptions.map((sub, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-white">{sub.plan_name}</p>
                            <p className="text-sm text-slate-400">{sub.billing_cycle}</p>
                          </div>
                          <span className="text-cyan-300 font-bold">{formatCurrency(sub.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Affiliate Info */}
              {selectedUser.user.is_affiliate && selectedUser.affiliate_stats && (
                <div className="space-y-4 border-b border-slate-800 pb-4">
                  <h3 className="text-lg font-semibold text-white">Affiliate Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-900/60 p-3 rounded-lg">
                      <p className="text-sm text-slate-400 mb-1">Referrals</p>
                      <p className="text-2xl font-bold text-white">{selectedUser.affiliate_stats.referrals_count}</p>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg">
                      <p className="text-sm text-slate-400 mb-1">Earned</p>
                      <p className="text-xl font-bold text-emerald-300">{formatCurrency(selectedUser.affiliate_stats.earned_commission)}</p>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg">
                      <p className="text-sm text-slate-400 mb-1">Pending Payout</p>
                      <p className="text-xl font-bold text-yellow-300">{formatCurrency(selectedUser.affiliate_stats.pending_payout)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-900"
                >
                  Close
                </button>
                {selectedUser.user.account_status === 'active' && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedUser.user.id, 'suspended');
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-rose-500/20 text-rose-300 rounded-lg hover:bg-rose-500/30 border border-rose-500/40"
                  >
                    Suspend Account
                  </button>
                )}
                {selectedUser.user.account_status === 'suspended' && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedUser.user.id, 'active');
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 border border-emerald-500/40"
                  >
                    Activate Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
