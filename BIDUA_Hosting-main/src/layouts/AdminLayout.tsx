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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#020617] dark:via-[#05050f] dark:to-[#020617] text-slate-900 dark:text-slate-100">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Fixed */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 lg:w-72 bg-white dark:bg-slate-950/95 backdrop-blur-2xl border-r border-slate-200 dark:border-slate-900 shadow-xl dark:shadow-[0_25px_65px_rgba(0,0,0,.65)] transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } overflow-y-auto lg:overflow-hidden flex flex-col`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-900/80 flex-shrink-0">
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                <Server className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">BIDUA</p>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Admin</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/60"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {adminLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-slate-900 dark:text-white dark:border-cyan-500/40 dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-blue-500/20 shadow-lg shadow-cyan-500/10'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <link.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{link.label}</span>
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-cyan-500 dark:bg-cyan-400"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-slate-200 dark:border-slate-900/70 p-4 flex-shrink-0">
            <div className="flex items-center gap-3 px-3 py-3 bg-slate-100 dark:bg-slate-950/70 rounded-lg mb-3 border border-slate-200 dark:border-slate-800">
              <div className="h-9 w-9 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow shadow-cyan-500/30 flex-shrink-0">
                {profile?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {profile?.full_name || 'Admin'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize truncate">
                  {profile?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-lg transition border border-slate-200 dark:border-slate-800 text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header - Sticky */}
          <header className="sticky top-0 z-40 h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950/80 backdrop-blur dark:backdrop-blur shadow-sm dark:shadow-[0_10px_35px_rgba(2,6,23,0.8)] flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/60"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">BIDUA Hosting</h2>
              <p className="text-lg font-bold text-slate-900 dark:text-white">Administration Console</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-500/10 rounded-full border border-cyan-200 dark:border-cyan-500/30">
              <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse"></div>
              <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">LIVE</span>
            </div>
          </header>

          {/* Main Content - Scrollable */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
