import { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  RefreshCw,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  Mail,
  Phone,
  Package,
  X
} from 'lucide-react';
import api from '../../lib/api';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';

interface Order {
  id: number;
  order_number: string;
  user_id: number;
  plan_id: number;
  order_status: 'pending' | 'active' | 'cancelled' | 'completed' | 'expired';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  billing_cycle: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  currency: string;
  payment_method: string;
  plan_name: string;
  created_at: string;
  paid_at: string;
  user: {
    id: number;
    email: string;
    full_name: string;
  };
}

interface OrderStats {
  total_orders: number;
  active_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
}

export function SubscriptionManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    total_orders: 0,
    active_orders: 0,
    pending_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    total_revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('skip', '0');
      params.append('limit', '100');

      const response = await api.request(`/api/v1/admin/orders?${params}`, { method: 'GET' });
      
      if (response && response.orders) {
        setOrders(response.orders);
        
        // Calculate stats from orders
        const activeCount = response.orders.filter((o: Order) => o.order_status === 'active').length;
        const pendingCount = response.orders.filter((o: Order) => o.order_status === 'pending').length;
        const completedCount = response.orders.filter((o: Order) => o.order_status === 'completed').length;
        const cancelledCount = response.orders.filter((o: Order) => o.order_status === 'cancelled').length;
        const totalRev = response.orders.reduce((sum: number, o: Order) => sum + o.grand_total, 0);

        setStats({
          total_orders: response.total || response.orders.length,
          active_orders: activeCount,
          pending_orders: pendingCount,
          completed_orders: completedCount,
          cancelled_orders: cancelledCount,
          total_revenue: totalRev
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (subscriptionId: number) => {
    if (!confirm('Manually renew this subscription?')) return;
    try {
      await api.request(`/api/v1/admin/subscriptions/${subscriptionId}/renew`, {
        method: 'POST',
      });
      alert('Subscription renewed successfully');
      await fetchData();
    } catch (error) {
      console.error('Error renewing subscription:', error);
      alert('Failed to renew subscription');
    }
  };

  const handleCancel = async (orderId: number) => {
    if (!confirm('Cancel this subscription? This action cannot be undone.')) return;
    try {
      await api.request(`/api/v1/admin/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ order_status: 'cancelled' }),
      });
      alert('Subscription cancelled successfully');
      await fetchData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  const filteredOrders = orders.filter(order =>
    (order.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.plan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.order_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40';
      case 'pending':
        return 'bg-amber-500/15 text-amber-200 border-amber-500/40';
      case 'completed':
        return 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40';
      case 'expired':
      case 'cancelled':
        return 'bg-rose-500/15 text-rose-200 border-rose-500/40';
      default:
        return 'bg-slate-500/15 text-slate-200 border-slate-500/40';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40';
      case 'pending':
        return 'bg-amber-500/15 text-amber-200 border-amber-500/40';
      case 'failed':
      case 'refunded':
        return 'bg-rose-500/15 text-rose-200 border-rose-500/40';
      default:
        return 'bg-slate-500/15 text-slate-200 border-slate-500/40';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'expired':
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Subscription Management"
        description="Monitor and manage all active subscriptions, renewals, and customer billing cycles."
        actions={
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 hover:bg-slate-900/70 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p className="text-sm text-slate-400">Total Orders</p>
          <p className="text-2xl font-bold text-white">{stats.total_orders}</p>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p className="text-sm text-slate-400">Active</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.active_orders}</p>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p className="text-sm text-slate-400">Pending</p>
          <p className="text-2xl font-bold text-amber-400">{stats.pending_orders}</p>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p className="text-sm text-slate-400">Completed</p>
          <p className="text-2xl font-bold text-cyan-400">{stats.completed_orders}</p>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p className="text-sm text-slate-400">Cancelled</p>
          <p className="text-2xl font-bold text-rose-400">{stats.cancelled_orders}</p>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p className="text-sm text-slate-400">Total Revenue</p>
          <p className="text-lg font-bold text-cyan-300">{formatCurrency(stats.total_revenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by user, email, plan, or order #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Orders</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950/60 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Order #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Plan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Billing</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Order Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Payment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Amount</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{order.user.full_name}</p>
                        <p className="text-sm text-slate-400">{order.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{order.order_number}</td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{order.plan_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 text-sm capitalize">{order.billing_cycle}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.order_status)}`}>
                        {getStatusIcon(order.order_status)}
                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-cyan-300 font-medium">{formatCurrency(order.grand_total)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetails(true);
                        }}
                        className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-sm hover:bg-cyan-500/30 border border-cyan-500/40"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-slate-950/60 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Order Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="border-b border-slate-800 pb-6">
                <h4 className="text-sm font-semibold text-slate-300 uppercase mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Name</p>
                    <p className="text-white font-medium">{selectedOrder.user.full_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Email</p>
                    <p className="text-white font-medium">{selectedOrder.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="border-b border-slate-800 pb-6">
                <h4 className="text-sm font-semibold text-slate-300 uppercase mb-3">Order Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Order Number</p>
                    <p className="text-white font-medium">{selectedOrder.order_number}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Plan</p>
                    <p className="text-white font-medium">{selectedOrder.plan_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Billing Cycle</p>
                    <p className="text-white font-medium capitalize">{selectedOrder.billing_cycle}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Created</p>
                    <p className="text-white font-medium">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="border-b border-slate-800 pb-6">
                <h4 className="text-sm font-semibold text-slate-300 uppercase mb-3">Financial Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="text-white">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Discount:</span>
                      <span className="text-emerald-400">-{formatCurrency(selectedOrder.discount_amount)}</span>
                    </div>
                  )}
                  {selectedOrder.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tax:</span>
                      <span className="text-white">{formatCurrency(selectedOrder.tax_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-800 pt-2 font-semibold">
                    <span className="text-slate-300">Grand Total:</span>
                    <span className="text-cyan-300">{formatCurrency(selectedOrder.grand_total)}</span>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Order Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border mt-1 ${getStatusColor(selectedOrder.order_status)}`}>
                    {getStatusIcon(selectedOrder.order_status)}
                    {selectedOrder.order_status.charAt(0).toUpperCase() + selectedOrder.order_status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Payment Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border mt-1 ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                    {selectedOrder.payment_status.charAt(0).toUpperCase() + selectedOrder.payment_status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-900"
                >
                  Close
                </button>
                {selectedOrder.order_status === 'active' && (
                  <button
                    onClick={() => {
                      handleCancel(selectedOrder.id);
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-rose-500/20 text-rose-300 rounded-lg hover:bg-rose-500/30 border border-rose-500/40"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
