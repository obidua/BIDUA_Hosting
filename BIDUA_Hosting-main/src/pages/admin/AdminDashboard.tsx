import { useState, useEffect } from 'react';
import {
  Users,
  Server,
  ShoppingCart,
  MessageSquare,
  TrendingUp,
  Briefcase,
  ArrowUpRight,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';

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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  const quickStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      helper: `+${stats.newUsersThisMonth} this month`,
      icon: Users,
      accent: 'bg-indigo-50 text-indigo-600',
      href: '/admin/users'
    },
    {
      title: 'Active Servers',
      value: stats.activeServers,
      helper: 'Running instances',
      icon: Server,
      accent: 'bg-emerald-50 text-emerald-600',
      href: '/admin/servers'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      helper: 'Lifetime sales',
      icon: ShoppingCart,
      accent: 'bg-orange-50 text-orange-600',
      href: '/admin/orders'
    },
    {
      title: 'Open Tickets',
      value: stats.openTickets,
      helper: 'Awaiting replies',
      icon: MessageSquare,
      accent: 'bg-rose-50 text-rose-600',
      href: '/admin/support'
    },
  ];

  const activityFeed = [
    { title: 'New enterprise order processed', meta: 'Order INV-1043 • ₹82,000', time: '14 min ago' },
    { title: 'Server provisioning completed', meta: 'VPS-80GB for @velocitylabs', time: '31 min ago' },
    { title: 'Ticket escalated to L2 support', meta: 'Billing dispute • Priority High', time: '1 hr ago' },
    { title: 'Razorpay settlement received', meta: '₹2,45,300 • 12 payouts', time: '2 hrs ago' },
  ];

  const actionShortcuts = [
    { label: 'Add Hosting Plan', description: 'Update pricing matrix & publish instantly', href: '/admin/plans', icon: ShoppingCart },
    { label: 'Review Servers', description: 'Provisioning queue & lifecycle controls', href: '/admin/servers', icon: Server },
    { label: 'Manage Team', description: 'Roles, departments & permissions', href: '/admin/employees', icon: Briefcase },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Operations Overview"
        description="Monitor the health of your hosting platform, revenue streams, and support queues from a single elevated view."
        actions={
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
        meta={[
          { label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue), helper: 'Last 30 days' },
          { label: 'Active Servers', value: stats.activeServers.toString(), helper: 'Provisioned & online' },
          { label: 'Tickets Awaiting', value: stats.openTickets.toString(), helper: 'Need response' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {quickStats.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-lg transition group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.accent} mb-4`}>
              <item.icon className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-500">{item.title}</p>
            <p className="text-3xl font-semibold text-slate-900 mt-1">{item.value.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-2">{item.helper}</p>
            <div className="mt-4 flex items-center text-sm font-semibold text-cyan-600">
              View details
              <ArrowUpRight className="h-4 w-4 ml-1 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Revenue Pace</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-1">{formatCurrency(stats.monthlyRevenue)}</h3>
              <p className="text-sm text-emerald-600 mt-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                +8.4% vs last month
              </p>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-xl text-sm text-slate-600">
              Billing cycle mix • Monthly focus
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Subscription renewals', value: '62%', helper: 'Auto-charge success rate' },
              { label: 'One-time purchases', value: '28%', helper: 'Add-ons & upgrades' },
              { label: 'Large contracts', value: '10%', helper: 'Quarterly / annual' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{row.label}</span>
                  <span className="font-semibold text-slate-900">{row.value}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: row.value }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{row.helper}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div>
            <p className="text-sm text-slate-500">Platform Health</p>
            <h3 className="text-xl font-semibold text-slate-900 mt-1">Operational signals</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Incident-free days', value: '21 days', icon: ShieldCheck, accent: 'text-emerald-600' },
              { label: 'Avg ticket response', value: '37 min', icon: Clock3, accent: 'text-cyan-600' },
              { label: 'Fulfilled orders', value: `${stats.totalOrders.toLocaleString()} total`, icon: CheckCircle2, accent: 'text-indigo-600' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                <div className={`${item.accent}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="font-semibold text-slate-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Live Activity</p>
              <h3 className="text-xl font-semibold text-slate-900">Ops timeline</h3>
            </div>
            <button className="text-sm text-cyan-600 hover:text-cyan-700 font-semibold">
              View audit log
            </button>
          </div>
          <div className="space-y-6">
            {activityFeed.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2"></div>
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.meta}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <p className="text-sm text-slate-500">Action Center</p>
            <h3 className="text-xl font-semibold text-slate-900">Operator shortcuts</h3>
          </div>
          <div className="space-y-4">
            {actionShortcuts.map((shortcut) => (
              <Link
                key={shortcut.label}
                to={shortcut.href}
                className="flex items-start gap-3 border border-slate-200 rounded-xl p-4 hover:border-cyan-200 hover:bg-cyan-50/50 transition"
              >
                <div className="p-2 rounded-lg bg-slate-50 text-slate-600">
                  <shortcut.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{shortcut.label}</p>
                  <p className="text-sm text-slate-500">{shortcut.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
