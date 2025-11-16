import { DocLayout } from '../../../components/docs/DocLayout';
import { BarChart3, Users, DollarSign, AlertCircle, Settings } from 'lucide-react';

export function AdminDashboard() {
  return (
    <DocLayout
      title="Admin Dashboard Guide"
      description="Complete guide to the admin control panel"
      breadcrumbs={[
        { label: 'Admin Guides', path: '/docs/admin' },
        { label: 'Dashboard' }
      ]}
      nextPage={{ title: 'User Management', path: '/docs/admin/users' }}
    >
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Overview</h2>
          <p className="text-slate-600 mb-4">
            The admin dashboard provides comprehensive controls for managing the BIDUA Hosting platform, users, servers, billing, and support operations.
          </p>
        </section>

        {/* Accessing Dashboard */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Accessing the Admin Panel</h2>

          <ol className="space-y-3 mb-6">
            <li className="flex items-start space-x-3">
              <span className="font-bold text-cyan-500">1</span>
              <span className="text-slate-600">Go to admin.biduahosting.com</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="font-bold text-cyan-500">2</span>
              <span className="text-slate-600">Log in with admin credentials</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="font-bold text-cyan-500">3</span>
              <span className="text-slate-600">Two-factor authentication (if enabled)</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="font-bold text-cyan-500">4</span>
              <span className="text-slate-600">Access main dashboard</span>
            </li>
          </ol>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
            <p className="text-slate-700"><strong>Security:</strong> Never share admin credentials. Enable 2FA on admin accounts.</p>
          </div>
        </section>

        {/* Dashboard Sections */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Dashboard Pages & Features</h2>

          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6 mb-6">
            <p className="text-slate-700 font-semibold mb-3">✨ Recent Updates (November 2025)</p>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li>• <strong>Dark Theme</strong> - All admin pages converted to modern dark slate theme</li>
              <li>• <strong>User Analytics</strong> - New comprehensive user dashboard with 500+ users, spending analysis, affiliate tracking</li>
              <li>• <strong>Subscription Management</strong> - Fixed and enhanced with real order data (500+ subscriptions)</li>
              <li>• <strong>Plans & Addons</strong> - Unified management with tabbed interface</li>
              <li>• <strong>Real-time Data</strong> - All pages now pull live data from backend API</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            {[
              {
                icon: BarChart3,
                title: 'Dashboard Home',
                items: ['Key metrics cards', 'Revenue overview', 'User statistics', 'System health']
              },
              {
                icon: Users,
                title: 'User Analytics',
                items: ['500+ user listing', 'Search & filter by status', 'User spending analysis', 'Affiliate tracking', 'Detailed user profiles']
              },
              {
                icon: DollarSign,
                title: 'Subscriptions',
                items: ['500+ active orders', 'Order status tracking', 'Payment status display', 'Revenue metrics', 'Order details modal']
              },
              {
                icon: Settings,
                title: 'Plans & Addons',
                items: ['Hosting plan management', 'Add-on services', 'Tabbed interface', 'Full CRUD operations', 'Real pricing data']
              }
            ].map((section, idx) => {
              const Icon = section.icon;
              return (
                <div key={idx} className="border border-slate-200 rounded-lg p-4">
                  <Icon className="h-6 w-6 text-cyan-500 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-3">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.items.map((item, iidx) => (
                      <li key={iidx} className="text-slate-600 text-sm">• {item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Dashboard Widgets */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Dashboard Widgets</h2>

          <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Metrics</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Users', value: '1,245', change: '+5.2%', color: 'cyan' },
              { label: 'Total Revenue', value: '$45,230', change: '+12.3%', color: 'green' },
              { label: 'Active Servers', value: '982', change: '+2.1%', color: 'blue' },
              { label: 'Support Tickets', value: '23', change: '-8.5%', color: 'orange' }
            ].map((metric, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-slate-600 text-sm">{metric.label}</p>
                <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                <p className={`text-sm font-semibold ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
              <h4 className="font-semibold text-slate-900">Latest Events</h4>
            </div>

            <div className="divide-y divide-slate-200">
              {[
                { time: '2 minutes ago', event: 'New user signup', user: 'John Doe', status: 'success' },
                { time: '15 minutes ago', event: 'Server created', user: 'VPS-1234', status: 'success' },
                { time: '1 hour ago', event: 'Payment received', user: '$130.90', status: 'success' },
                { time: '2 hours ago', event: 'Support ticket', user: 'Ticket #5432', status: 'pending' }
              ].map((activity, idx) => (
                <div key={idx} className="px-6 py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-900">{activity.event}</p>
                    <p className="text-slate-600 text-sm">{activity.user}</p>
                  </div>
                  <p className="text-slate-600 text-sm">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Main Navigation Menu</h2>

          <p className="text-slate-600 mb-6">The admin dashboard sidebar provides quick access to all key admin sections:</p>

          <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
            <h3 className="font-semibold text-slate-900 mb-4">Left Sidebar Menu Items</h3>

            <div className="space-y-3 text-slate-600">
              <p className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-cyan-500 rounded"></span>
                <span><strong>Dashboard</strong> - Home overview with key metrics</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-cyan-500 rounded"></span>
                <span><strong>Users</strong> - Manage admin staff and support users</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-cyan-500 rounded"></span>
                <span><strong>User Analytics</strong> - <span className="text-green-600 font-semibold">[NEW]</span> Comprehensive user data, spending, affiliates</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-cyan-500 rounded"></span>
                <span><strong>Orders/Subscriptions</strong> - View 500+ customer orders and subscriptions</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-cyan-500 rounded"></span>
                <span><strong>Plans & Addons</strong> - Manage hosting plans and add-on services</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-cyan-500 rounded"></span>
                <span><strong>Servers</strong> - Monitor and control VPS/Cloud/Dedicated servers</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-cyan-500 rounded"></span>
                <span><strong>Billing</strong> - Invoice management and payment tracking</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-cyan-500 rounded"></span>
                <span><strong>Support Tickets</strong> - Customer support issue management</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-cyan-500 rounded"></span>
                <span><strong>Affiliates</strong> - Manage referral program and commissions</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-cyan-500 rounded"></span>
                <span><strong>Employees</strong> - Employee account and role management</span>
              </p>
            </div>
          </div>
        </section>

        {/* Filtering & Search */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Filtering & Search</h2>

          <p className="text-slate-600 mb-6">
            Most admin panels have search and filter capabilities:
          </p>

          <div className="space-y-4 mb-6">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Search Box</h3>
              <p className="text-slate-600 text-sm">Quick search by name, email, ID, or username</p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Filters</h3>
              <p className="text-slate-600 text-sm">Filter by status, date range, plan type, etc</p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Export</h3>
              <p className="text-slate-600 text-sm">Export data to CSV or PDF for reports</p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Sorting</h3>
              <p className="text-slate-600 text-sm">Sort by any column - click column header</p>
            </div>
          </div>
        </section>

        {/* Reports */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Reports & Analytics</h2>

          <p className="text-slate-600 mb-6">
            Access detailed reports and analytics:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { title: 'Revenue Report', desc: 'Daily, monthly, yearly revenue' },
              { title: 'User Growth', desc: 'New users, churn, retention' },
              { title: 'Server Usage', desc: 'Resource utilization metrics' },
              { title: 'Payment Analysis', desc: 'Payment methods, failed payments' },
              { title: 'Support Metrics', desc: 'Ticket volume, response times' },
              { title: 'Plan Analytics', desc: 'Popular plans, upgrades, downgrades' }
            ].map((report, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-1">{report.title}</h4>
                <p className="text-slate-600 text-sm">{report.desc}</p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-4">Generating Reports</h3>

          <ol className="space-y-2 text-slate-600">
            <li>1. Click "Reports" from sidebar</li>
            <li>2. Select report type</li>
            <li>3. Set date range</li>
            <li>4. Choose format (PDF, CSV, Excel)</li>
            <li>5. Click "Generate" or "Export"</li>
          </ol>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Quick Actions</h2>

          <p className="text-slate-600 mb-6">
            Commonly used admin tasks:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              'Create new user',
              'Issue refund',
              'Suspend account',
              'Create server',
              'Process payment',
              'Send announcement',
              'View logs',
              'System status'
            ].map((action, idx) => (
              <button key={idx} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
                {action}
              </button>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Admin Tips</h2>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
            <ul className="space-y-2 text-slate-700">
              <li>• Keep admin account secure with strong password and 2FA</li>
              <li>• Review activity logs regularly</li>
              <li>• Generate backups weekly</li>
              <li>• Monitor system performance metrics</li>
              <li>• Update system regularly</li>
              <li>• Document all major changes</li>
              <li>• Review and reconcile billing weekly</li>
            </ul>
          </div>
        </section>

        {/* New Features Section */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">✨ New Features (v2.0 Update)</h2>

          <div className="space-y-6">
            {/* User Analytics */}
            <div className="border-l-4 border-cyan-500 bg-cyan-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">User Analytics Dashboard</h3>
              <p className="text-slate-600 mb-4">
                Comprehensive user management and analytics page with advanced filtering and detailed user profiles.
              </p>
              <div className="bg-white rounded-lg p-4 border border-cyan-200 mb-4">
                <h4 className="font-semibold text-slate-900 mb-3">Features:</h4>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>✓ View 500+ users with real-time data</li>
                  <li>✓ Search by name or email</li>
                  <li>✓ Filter by account status (active, suspended, banned)</li>
                  <li>✓ User statistics: total spent, subscriptions, servers</li>
                  <li>✓ Affiliate tracking and earnings display</li>
                  <li>✓ Detailed user profile modal with full information</li>
                  <li>✓ Dark theme styling for better visibility</li>
                </ul>
              </div>
              <div className="bg-slate-900 text-cyan-200 rounded-lg p-3 font-mono text-sm">
                <strong>API Endpoint:</strong> GET /api/v1/admin/users?skip=0&limit=500
              </div>
            </div>

            {/* Subscription Management */}
            <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Subscription Management (Fixed)</h3>
              <p className="text-slate-600 mb-4">
                Enhanced subscription/order management with real backend integration showing 500+ active orders.
              </p>
              <div className="bg-white rounded-lg p-4 border border-green-200 mb-4">
                <h4 className="font-semibold text-slate-900 mb-3">Features:</h4>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>✓ Display 500+ customer orders/subscriptions</li>
                  <li>✓ 6 stat cards: total, active, pending, completed, cancelled, revenue</li>
                  <li>✓ Order status tracking (active, pending, completed, cancelled, expired)</li>
                  <li>✓ Payment status display (paid, pending, failed, refunded)</li>
                  <li>✓ Billing cycle information (monthly, quarterly, annual, biennial, triennial)</li>
                  <li>✓ Revenue and financial breakdown</li>
                  <li>✓ Search and filter capabilities</li>
                  <li>✓ Detailed order modal with customer information</li>
                </ul>
              </div>
              <div className="bg-slate-900 text-green-200 rounded-lg p-3 font-mono text-sm">
                <strong>API Endpoint:</strong> GET /api/v1/admin/orders?skip=0&limit=100&status=&lt;status&gt;
              </div>
            </div>

            {/* Plans & Addons */}
            <div className="border-l-4 border-indigo-500 bg-indigo-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Plans & Add-ons Management</h3>
              <p className="text-slate-600 mb-4">
                Unified interface for managing hosting plans and add-on services with full CRUD operations.
              </p>
              <div className="bg-white rounded-lg p-4 border border-indigo-200 mb-4">
                <h4 className="font-semibold text-slate-900 mb-3">Features:</h4>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>✓ Tabbed interface: Plans tab + Add-ons tab</li>
                  <li>✓ Real hosting plan data (VPS, Cloud, Dedicated)</li>
                  <li>✓ Add-on services management (backup, SSL, support, etc)</li>
                  <li>✓ Create, read, update, delete operations</li>
                  <li>✓ Pricing configuration</li>
                  <li>✓ Plan features and specifications</li>
                  <li>✓ Real-time data from backend</li>
                </ul>
              </div>
              <div className="bg-slate-900 text-indigo-200 rounded-lg p-3 font-mono text-sm">
                <strong>API Endpoints:</strong><br/>
                GET /api/v1/admin/plans<br/>
                GET /api/v1/admin/addons
              </div>
            </div>

            {/* Dark Theme */}
            <div className="border-l-4 border-slate-500 bg-slate-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Modern Dark Theme</h3>
              <p className="text-slate-600 mb-4">
                All admin pages converted to a consistent dark theme for better visibility and reduced eye strain.
              </p>
              <div className="bg-white rounded-lg p-4 border border-slate-300 mb-4">
                <h4 className="font-semibold text-slate-900 mb-3">Color Scheme:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-slate-950 border border-slate-700 rounded"></div>
                    <span className="text-slate-700">bg-slate-950 (Primary)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-slate-900 border border-slate-700 rounded"></div>
                    <span className="text-slate-700">bg-slate-900 (Secondary)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-cyan-500 rounded"></div>
                    <span className="text-slate-700">cyan-500 (Accent)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white rounded border border-slate-300"></div>
                    <span className="text-slate-700">White (Text)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Technical Implementation</h2>

          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Frontend Stack</h3>
              <ul className="space-y-1 text-slate-600 text-sm">
                <li>• React 18 with TypeScript</li>
                <li>• Vite for fast builds</li>
                <li>• Tailwind CSS for styling</li>
                <li>• React Router for navigation</li>
                <li>• Lucide icons for UI</li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Backend API</h3>
              <ul className="space-y-1 text-slate-600 text-sm">
                <li>• FastAPI (Python)</li>
                <li>• SQLAlchemy ORM</li>
                <li>• SQLite database</li>
                <li>• RESTful architecture</li>
                <li>• Comprehensive admin endpoints</li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Build & Deployment</h3>
              <ul className="space-y-1 text-slate-600 text-sm">
                <li>• Current build: 1586 modules</li>
                <li>• Build size: ~1.4MB JS, ~102KB CSS (gzipped)</li>
                <li>• Build time: ~1m 22s</li>
                <li>• Zero TypeScript errors</li>
                <li>• Optimized for production</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </DocLayout>
  );
}
