import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TawkToWidget } from './components/TawkToWidget';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { Home } from './pages/Home';
import { Pricing } from './pages/Pricing';
import { DedicatedServers } from './pages/DedicatedServers';
import { Solutions } from './pages/Solutions';
import { Contact } from './pages/Contact';
import { Calculator } from './pages/Calculator';
import { Checkout } from './pages/Checkout';
import { InvoiceView } from './pages/InvoiceView';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { ServiceLevelAgreement } from './pages/ServiceLevelAgreement';

import { Overview } from './pages/dashboard/Overview';
import { MyServers } from './pages/dashboard/MyServers';
import { ReferralsEnhanced as Referrals } from './pages/dashboard/ReferralsEnhanced';
import { Billing } from './pages/dashboard/Billing';
import { SupportEnhanced as Support } from './pages/dashboard/SupportEnhanced';
import { Settings } from './pages/dashboard/Settings';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ReferralManagement } from './pages/admin/ReferralManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { ServerManagement } from './pages/admin/ServerManagement';
import { PlansManagement } from './pages/admin/PlansManagement';
import { OrdersManagement } from './pages/admin/OrdersManagement';
import { SupportManagementEnhanced as SupportManagement } from './pages/admin/SupportManagementEnhanced';
import SplashCursor from './components/SplashCurser';

function App() {
  return (
    <>
    <SplashCursor/>
    <BrowserRouter>
      <AuthProvider>
        <TawkToWidget hideOnRoutes={['/login', '/signup']} />
        <PWAInstallPrompt />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/invoice/:invoiceId" element={<InvoiceView />} />
            <Route path="/dedicated-servers" element={<DedicatedServers />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/sla" element={<ServiceLevelAgreement />} />
          </Route>

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
            <Route path="referrals" element={<Referrals />} />
            <Route path="billing" element={<Billing />} />
            <Route path="support" element={<Support />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="servers" element={<ServerManagement />} />
            <Route path="plans" element={<PlansManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="referrals" element={<ReferralManagement />} />
            <Route path="support" element={<SupportManagement />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </>
  );
}

export default App;
