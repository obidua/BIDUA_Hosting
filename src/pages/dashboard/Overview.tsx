import { Server, CreditCard, AlertCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Overview() {
  const stats = [
    {
      label: 'Active Servers',
      value: '3',
      icon: Server,
      color: 'blue',
      link: '/dashboard/servers',
    },
    {
      label: 'Monthly Cost',
      value: '₹5,600',
      icon: CreditCard,
      color: 'green',
      link: '/dashboard/billing',
    },
    {
      label: 'Open Tickets',
      value: '1',
      icon: AlertCircle,
      color: 'orange',
      link: '/dashboard/support',
    },
    {
      label: 'Bandwidth Used',
      value: '2.4TB',
      icon: TrendingUp,
      color: 'purple',
      link: '/dashboard/servers',
    },
  ];

  const recentServers = [
    {
      id: 1,
      name: 'Production Web Server',
      hostname: 'web-prod-01.bidua.cloud',
      status: 'active',
      ip: '192.168.1.100',
      plan: 'Professional',
    },
    {
      id: 2,
      name: 'Database Server',
      hostname: 'db-prod-01.bidua.cloud',
      status: 'active',
      ip: '192.168.1.101',
      plan: 'Memory Plus',
    },
    {
      id: 3,
      name: 'Development Server',
      hostname: 'dev-01.bidua.cloud',
      status: 'stopped',
      ip: '192.168.1.102',
      plan: 'Starter',
    },
  ];

  const recentInvoices = [
    {
      id: 1,
      number: 'INV-2024-001',
      date: '2024-10-01',
      amount: 5600,
      status: 'paid',
    },
    {
      id: 2,
      number: 'INV-2024-002',
      date: '2024-11-01',
      amount: 5600,
      status: 'paid',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; hover: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', hover: 'hover:bg-blue-50' },
    green: { bg: 'bg-green-100', text: 'text-green-600', hover: 'hover:bg-green-50' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', hover: 'hover:bg-orange-50' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', hover: 'hover:bg-purple-50' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
        <p className="text-gray-600">Here's what's happening with your servers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const colors = colorClasses[stat.color];
          return (
            <Link
              key={index}
              to={stat.link}
              className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${colors.hover} transition`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${colors.text}`} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Your Servers</h3>
              <Link
                to="/dashboard/servers"
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentServers.map((server) => (
              <div key={server.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{server.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{server.hostname}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{server.ip}</span>
                      <span>•</span>
                      <span>{server.plan}</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      server.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {server.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
              <Link
                to="/dashboard/billing"
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{invoice.number}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(invoice.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{invoice.amount.toLocaleString()}</p>
                    <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Paid
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-2">Need More Resources?</h3>
        <p className="text-blue-100 mb-6">
          Upgrade your servers or add new ones to scale your infrastructure
        </p>
        <Link
          to="/pricing"
          className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
        >
          View Plans
        </Link>
      </div>
    </div>
  );
}
