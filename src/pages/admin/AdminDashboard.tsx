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
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600">Overview of your hosting platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const colors = colorClasses[stat.color];
          const isPositive = stat.change.startsWith('+');
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.user}</p>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-left">
              Add New User
            </button>
            <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-left">
              Create Hosting Plan
            </button>
            <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-left">
              Provision Server
            </button>
            <button className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold text-left">
              View Support Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
