import { useState, useEffect } from 'react';
import { Users, Server, ShoppingCart, MessageSquare, DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeServers: 0,
    totalOrders: 0,
    openTickets: 0,
    monthlyRevenue: 0,
    newUsersThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsData = await api.getAdminStats();
      
      if (statsData) {
        setStats({
          totalUsers: statsData.total_users || 0,
          activeServers: statsData.active_servers || 0,
          totalOrders: statsData.total_orders || 0,
          openTickets: statsData.open_tickets || 0,
          monthlyRevenue: statsData.monthly_revenue || 0,
          newUsersThisMonth: statsData.new_users_this_month || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set some default values for now
      setStats({
        totalUsers: 0,
        activeServers: 0,
        totalOrders: 0,
        openTickets: 0,
        monthlyRevenue: 0,
        newUsersThisMonth: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the BIDUA IT Connect admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/users" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                <p className="text-sm text-green-600 mt-1">
                  +{stats.newUsersThisMonth} this month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/servers" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Servers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeServers}</p>
                <p className="text-sm text-gray-500 mt-1">Running</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/orders" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                <p className="text-sm text-gray-500 mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/support" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.openTickets}</p>
                <p className="text-sm text-orange-600 mt-1">Needs attention</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${stats.monthlyRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                This month
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <Link to="/admin/referrals" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Referral Program</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">Active</p>
                <p className="text-sm text-blue-600 mt-1">View details</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/users"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <Users className="w-8 h-8 mx-auto text-gray-600 mb-2" />
            <p className="font-medium text-gray-900">Manage Users</p>
          </Link>
          <Link
            to="/admin/servers"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
          >
            <Server className="w-8 h-8 mx-auto text-gray-600 mb-2" />
            <p className="font-medium text-gray-900">Manage Servers</p>
          </Link>
          <Link
            to="/admin/plans"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
          >
            <ShoppingCart className="w-8 h-8 mx-auto text-gray-600 mb-2" />
            <p className="font-medium text-gray-900">Manage Plans</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
