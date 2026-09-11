import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, BarChart3, Server, Clock, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function ProviderLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut, isProvider } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const navItems = [
    { path: '/provider', icon: BarChart3, label: 'Dashboard', end: true },
    { path: '/provider/servers', icon: Server, label: 'Servers' },
    { path: '/provider/expiry-tracker', icon: Clock, label: 'Expiry Tracker' },
    // Settings page not yet implemented
    // { path: '/provider/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 lg:relative lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Close button on mobile */}
        <div className="flex lg:hidden items-center justify-between p-4 border-b border-slate-800">
          <h1 className="text-xl font-bold text-cyan-400">Provider Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="hidden lg:flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-800">
            <h1 className="text-xl font-bold text-cyan-400">Provider Dashboard</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-auto p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-slate-800 p-4 space-y-2">
            <div className="flex items-center space-x-3 px-4 py-3 bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold text-slate-950">
                {profile?.full_name?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{profile?.full_name}</p>
                <p className="text-xs text-slate-400 truncate">{profile?.role}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex-1 overflow-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile User Profile */}
        <div className="lg:hidden border-t border-slate-800 p-4 space-y-2">
          <div className="flex items-center space-x-3 px-4 py-3 bg-slate-800 rounded-lg">
            <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold text-slate-950">
              {profile?.full_name?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{profile?.full_name}</p>
              <p className="text-xs text-slate-400 truncate">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <Menu className="w-6 h-6 text-slate-300" />
          </button>
          
          <div className="flex-1 hidden lg:block" />
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-slate-300">System Active</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
