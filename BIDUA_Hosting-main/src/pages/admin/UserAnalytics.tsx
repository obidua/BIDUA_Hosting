import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Globe,
  X
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
  affiliate_earnings?: number;
  total_spent?: number;
  active_subscriptions?: number;
  total_servers?: number;
  created_at: string;
  last_login?: string;
}

interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  country?: string;
  city?: string;
  account_status: string;
  is_affiliate: boolean;
  created_at: string;
}

interface UserStats {
  total_users: number;
  active_users: number;
  affiliate_users: number;
  total_revenue: number;
}

export const UserAnalytics = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin/users?skip=0&limit=500');
      setUsers(response.users || response.items || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const loadUserDetails = async (userId: number) => {
    try {
      const response = await api.get(`/api/v1/admin/users/${userId}`);
      if (response) {
        setSelectedUser(response);
      }
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.account_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40';
      case 'suspended':
        return 'bg-amber-500/15 text-amber-200 border-amber-500/40';
      case 'banned':
        return 'bg-rose-500/15 text-rose-200 border-rose-500/40';
      default:
        return 'bg-slate-500/15 text-slate-200 border-slate-500/40';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatDate = (date: string | undefined) => {
    return new Date(date || '').toLocaleDateString('en-IN');
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
        title="User Analytics"
        description="Monitor user demographics, subscriptions, spending, and affiliate status."
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
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p className="text-sm text-slate-400">Active Users</p>
          <p className="text-2xl font-bold text-emerald-400">
            {users.filter(u => u.account_status === 'active').length}
          </p>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p className="text-sm text-slate-400">Affiliates</p>
          <p className="text-2xl font-bold text-cyan-400">
            {users.filter(u => u.is_affiliate).length}
          </p>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p className="text-sm text-slate-400">Total Revenue</p>
          <p className="text-lg font-bold text-cyan-300">
            {formatCurrency(users.reduce((sum, u) => sum + (u.total_spent || 0), 0))}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
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
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Total Spent</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Subscriptions</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Servers</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Affiliate</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Joined</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-900/40 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{user.full_name}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(user.account_status)}`}>
                      {user.account_status.charAt(0).toUpperCase() + user.account_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-cyan-300 font-medium">{formatCurrency(user.total_spent || 0)}</td>
                  <td className="px-6 py-4 text-slate-300">{user.active_subscriptions || 0}</td>
                  <td className="px-6 py-4 text-slate-300">{user.total_servers || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                      user.is_affiliate
                        ? 'bg-indigo-500/15 text-indigo-200 border-indigo-500/40'
                        : 'bg-slate-500/15 text-slate-200 border-slate-500/40'
                    }`}>
                      {user.is_affiliate ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        loadUserDetails(user.id);
                        setShowDetails(true);
                      }}
                      className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-sm hover:bg-cyan-500/30 border border-cyan-500/40"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-slate-950/60 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">User Profile</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="border-b border-slate-800 pb-6">
                <h4 className="text-sm font-semibold text-slate-300 uppercase mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Name</p>
                    <p className="text-white font-medium">{selectedUser.full_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Email</p>
                    <p className="text-white font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Phone</p>
                    <p className="text-white font-medium">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Location</p>
                    <p className="text-white font-medium">{selectedUser.country || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border mt-1 ${getStatusColor(selectedUser.account_status)}`}>
                      {selectedUser.account_status.charAt(0).toUpperCase() + selectedUser.account_status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Joined</p>
                    <p className="text-white font-medium">{formatDate(selectedUser.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="border-b border-slate-800 pb-6">
                <h4 className="text-sm font-semibold text-slate-300 uppercase mb-3">Activity</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 p-3 rounded-lg">
                    <p className="text-slate-400 text-sm">Total Spent</p>
                    <p className="text-cyan-300 font-bold text-lg">{formatCurrency(selectedUser.total_spent || 0)}</p>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg">
                    <p className="text-slate-400 text-sm">Active Subscriptions</p>
                    <p className="text-emerald-300 font-bold text-lg">{selectedUser.active_subscriptions || 0}</p>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg">
                    <p className="text-slate-400 text-sm">Total Servers</p>
                    <p className="text-blue-300 font-bold text-lg">{selectedUser.total_servers || 0}</p>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg">
                    <p className="text-slate-400 text-sm">Is Affiliate</p>
                    <p className={`font-bold text-lg ${selectedUser.is_affiliate ? 'text-indigo-300' : 'text-slate-400'}`}>
                      {selectedUser.is_affiliate ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Affiliate Info */}
              {selectedUser.is_affiliate && (
                <div className="pb-4">
                  <h4 className="text-sm font-semibold text-slate-300 uppercase mb-3">Affiliate Info</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/40">
                      <p className="text-slate-400 text-sm">Earnings</p>
                      <p className="text-indigo-300 font-bold">{formatCurrency(selectedUser.affiliate_earnings || 0)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
