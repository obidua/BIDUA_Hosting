import { Users, Server, ShoppingCart, MessageSquare, DollarSign, TrendingUp } from 'lucide-react';

export function AdminDashboard() {
  const stats = [
    {
      label: 'Total Users',
      value: '2,543',
      change: '+12.5%',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Active Servers',
      value: '8,234',
      change: '+8.2%',
      icon: Server,
      color: 'green',
    },
    {
      label: 'Monthly Revenue',
      value: '₹12.4M',
      change: '+15.3%',
      icon: DollarSign,
      color: 'purple',
    },
    {
      label: 'Open Tickets',
      value: '47',
      change: '-5.1%',
      icon: MessageSquare,
      color: 'orange',
    },
    {
      label: 'Total Orders',
      value: '1,829',
      change: '+9.8%',
      icon: ShoppingCart,
      color: 'teal',
    },
    {
      label: 'Growth Rate',
      value: '23.1%',
      change: '+3.2%',
      icon: TrendingUp,
      color: 'pink',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'New user registration',
      user: 'John Doe',
      time: '2 minutes ago',
      type: 'success',
    },
    {
      id: 2,
      action: 'Server provisioned',
      user: 'Jane Smith',
      time: '15 minutes ago',
      type: 'info',
    },
    {
      id: 3,
      action: 'Payment received',
      user: 'Mike Johnson',
      time: '1 hour ago',
      type: 'success',
    },
    {
      id: 4,
      action: 'Support ticket opened',
      user: 'Sarah Williams',
      time: '2 hours ago',
      type: 'warning',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
    teal: { bg: 'bg-teal-100', text: 'text-teal-600' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
        <p className="text-slate-400">Overview of your hosting platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const colors = colorClasses[stat.color];
          const isPositive = stat.change.startsWith('+');
          return (
            <div key={index} className="bg-slate-900 p-6 rounded-xl shadow-sm border-2 border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30 transition">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-xl shadow-sm border-2 border-cyan-500">
          <div className="p-6 border-b border-cyan-500">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="divide-y divide-cyan-500/30">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-slate-800 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{activity.action}</p>
                    <p className="text-sm text-slate-400 mt-1">{activity.user}</p>
                  </div>
                  <span className="text-sm text-slate-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl shadow-sm border-2 border-cyan-500 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-semibold text-left border-2 border-cyan-500">
              Add New User
            </button>
            <button className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-400 hover:to-green-400 transition font-semibold text-left">
              Create Hosting Plan
            </button>
            <button className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-400 hover:to-cyan-400 transition font-semibold text-left">
              Provision Server
            </button>
            <button className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-400 hover:to-red-400 transition font-semibold text-left">
              View Support Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
