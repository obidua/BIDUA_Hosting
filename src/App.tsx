import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TawkToWidget } from './components/TawkToWidget';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

import { Home } from './pages/Home';
import { Pricing } from './pages/Pricing';
import { DedicatedServers } from './pages/DedicatedServers';
import { Solutions } from './pages/Solutions';
import { Contact } from './pages/Contact';
import { Calculator } from './pages/Calculator';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

import { Overview } from './pages/dashboard/Overview';
import { MyServers } from './pages/dashboard/MyServers';

import { AdminDashboard } from './pages/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TawkToWidget hideOnRoutes={['/login', '/signup']} />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/dedicated-servers" element={<DedicatedServers />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="servers" element={<MyServers />} />
            <Route path="billing" element={<div className="text-center py-20"><h2 className="text-2xl font-bold text-gray-900">Billing Page</h2><p className="text-gray-600">Coming soon</p></div>} />
            <Route path="support" element={<div className="text-center py-20"><h2 className="text-2xl font-bold text-gray-900">Support Page</h2><p className="text-gray-600">Coming soon</p></div>} />
            <Route path="settings" element={<div className="text-center py-20"><h2 className="text-2xl font-bold text-gray-900">Settings Page</h2><p className="text-gray-600">Coming soon</p></div>} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<div className="text-center py-20"><h2 className="text-2xl font-bold text-gray-900">User Management</h2><p className="text-gray-600">Coming soon</p></div>} />
            <Route path="servers" element={<div className="text-center py-20"><h2 className="text-2xl font-bold text-gray-900">Server Management</h2><p className="text-gray-600">Coming soon</p></div>} />
            <Route path="plans" element={<div className="text-center py-20"><h2 className="text-2xl font-bold text-gray-900">Plans Management</h2><p className="text-gray-600">Coming soon</p></div>} />
            <Route path="orders" element={<div className="text-center py-20"><h2 className="text-2xl font-bold text-gray-900">Orders Management</h2><p className="text-gray-600">Coming soon</p></div>} />
            <Route path="support" element={<div className="text-center py-20"><h2 className="text-2xl font-bold text-gray-900">Support Management</h2><p className="text-gray-600">Coming soon</p></div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
