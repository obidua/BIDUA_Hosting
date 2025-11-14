import { useState, useEffect } from 'react';
import { Search, UserPlus, Mail, Shield, Ban, Check } from 'lucide-react';
import api from '../../lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  account_status: string;
  created_at: string;
  referral_code?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.request('/api/v1/admin/users?limit=1000');
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.account_status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'support':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'suspended':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'banned':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-2">Manage all platform users</p>
        </div>
        <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 p-6 rounded-lg border border-red-500/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-red-500/30 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-slate-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-red-500/30 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="support">Support</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-red-500/30 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 rounded-lg border border-red-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-950 border-b border-red-500/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-500/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-950/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{user.full_name || user.username}</div>
                        <div className="text-sm text-slate-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRoleBadgeClass(user.role)}`}>
                      {user.role?.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeClass(user.account_status)}`}>
                      {user.account_status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-400 hover:text-blue-300 transition">
                        <Shield className="w-5 h-5" />
                      </button>
                      <button className="text-red-400 hover:text-red-300 transition">
                        <Ban className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 rounded-lg border border-red-500/20">
        <div className="text-sm text-slate-400">
          Showing <span className="font-medium text-white">{filteredUsers.length}</span> of <span className="font-medium text-white">{users.length}</span> users
        </div>
      </div>
    </div>
  );
}
