import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Server,
  MessageSquare,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Users,
  ShoppingCart,
  Gift,
  Package,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/servers', icon: Server, label: 'Server Management' },
    { to: '/admin/plans', icon: Package, label: 'Plans Management' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders Management' },
    { to: '/admin/referrals', icon: Gift, label: 'Referral Management' },
    { to: '/admin/support', icon: MessageSquare, label: 'Support Management' },
    { to: '/admin/employees', icon: Briefcase, label: 'Employee Management' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[17rem] bg-white/90 backdrop-blur border-r border-slate-200 shadow-2xl transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
              <Link to="/admin" className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500">BIDUA</p>
                  <span className="text-lg font-bold text-slate-900">Admin Panel</span>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {adminLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
                      isActive
                        ? 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    <div className="flex-1">
                      <span className="font-medium">{link.label}</span>
                      {isActive && <div className="text-xs text-slate-400">Currently viewing</div>}
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center space-x-3 px-4 py-3 bg-slate-50 rounded-xl mb-3 border border-slate-200">
                <div className="w-11 h-11 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-semibold">
                  {profile?.full_name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {profile?.full_name || 'Admin'}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {profile?.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-3 w-full px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition border border-slate-200"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="sticky top-0 z-40 flex items-center h-16 px-4 sm:px-6 lg:px-8 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700 mr-4"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">BIDUA Hosting</p>
                <h2 className="text-lg font-semibold text-slate-900">Administration Console</h2>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-cyan-50 rounded-full border border-cyan-200">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-cyan-700 tracking-wide">LIVE</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
