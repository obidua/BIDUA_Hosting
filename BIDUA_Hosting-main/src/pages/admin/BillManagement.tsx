import { useState, useEffect } from 'react';
import { FileText, Search, RefreshCw, Filter, Eye, Download, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';

interface InvoiceData {
  id: number;
  invoice_number: string;
  user_id: number;
  order_id: number | null;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  payment_date: string | null;
  currency: string;
  items: any[];
  user?: {
    id: number;
    email: string;
    full_name: string;
  };
  order?: {
    id: number;
    order_number: string;
  } | null;
}

interface InvoiceStats {
  total_invoices: number;
  paid_invoices: number;
  pending_invoices: number;
  overdue_invoices: number;
  total_revenue: number;
  outstanding_amount: number;
  paid_percentage: number;
}

export function BillManagement() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.request('/api/v1/admin/invoices?limit=1000', { method: 'GET' });
      if (response && response.invoices) {
        setInvoices(Array.isArray(response.invoices) ? response.invoices : []);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.request('/api/v1/admin/invoices/stats', { method: 'GET' });
      if (response) {
        setStats(response);
      }
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-slate-500/15 text-slate-200 border border-slate-500/40',
      issued: 'bg-blue-500/15 text-blue-200 border border-blue-500/40',
      sent: 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/40',
      paid: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40',
      cancelled: 'bg-rose-500/15 text-rose-200 border border-rose-500/40',
      overdue: 'bg-orange-500/15 text-orange-200 border border-orange-500/40',
    };
    return styles[status] || 'bg-slate-600/20 text-slate-200 border border-slate-600/40';
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-500/15 text-amber-200 border border-amber-500/40',
      paid: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40',
      partially_paid: 'bg-yellow-500/15 text-yellow-200 border border-yellow-500/40',
      failed: 'bg-rose-500/15 text-rose-200 border border-rose-500/40',
      refunded: 'bg-purple-500/15 text-purple-200 border border-purple-500/40',
    };
    return styles[status] || 'bg-slate-600/20 text-slate-200 border border-slate-600/40';
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.user?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || invoice.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Bill Management"
        description="Track invoices, payments, and financial records in real-time."
        actions={
          <button
            onClick={() => { fetchInvoices(); fetchStats(); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 hover:bg-slate-900/70 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Total Invoices</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total_invoices}</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Paid</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.paid_invoices}</p>
            <p className="text-xs text-slate-500 mt-1">{stats.paid_percentage.toFixed(0)}%</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pending_invoices}</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Overdue</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">{stats.overdue_invoices}</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Total Revenue</p>
            <p className="text-xl font-bold text-cyan-300 mt-1">{formatCurrency(stats.total_revenue)}</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Outstanding</p>
            <p className="text-xl font-bold text-orange-400 mt-1">{formatCurrency(stats.outstanding_amount)}</p>
          </div>
        </div>
      )}

      {/* Overdue Alert */}
      {stats && stats.overdue_invoices > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">⚠️ Overdue Invoices</p>
            <p className="text-sm text-rose-300/80">You have {stats.overdue_invoices} overdue invoice{stats.overdue_invoices !== 1 ? 's' : ''} totaling {formatCurrency(stats.outstanding_amount)}. Please take action.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-900 shadow-[0_15px_45px_rgba(2,6,23,0.7)]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by invoice number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-slate-500 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-900 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="issued">Issued</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 bg-slate-900 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-950/60 rounded-2xl border border-slate-900 overflow-hidden shadow-[0_15px_45px_rgba(2,6,23,0.7)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-900 text-slate-200">
            <thead className="bg-slate-950/70">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-900/60 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-slate-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-white">{invoice.invoice_number}</div>
                        <div className="text-xs text-slate-400">{formatDate(invoice.invoice_date)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{invoice.user?.full_name || 'N/A'}</div>
                    <div className="text-sm text-slate-400">{invoice.user?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-cyan-200">{formatCurrency(invoice.total_amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-emerald-200">{formatCurrency(invoice.amount_paid)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${invoice.balance_due > 0 ? 'text-amber-200' : 'text-emerald-200'}`}>
                      {formatCurrency(invoice.balance_due)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentBadge(invoice.payment_status)}`}>
                      {invoice.payment_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-400">{formatDate(invoice.due_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowDetails(true);
                        }}
                        className="p-1 text-cyan-300 hover:bg-cyan-500/10 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-slate-400 hover:bg-slate-700/40 rounded"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No invoices found</p>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {showDetails && selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-900 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_30px_80px_rgba(0,0,0,0.75)]">
            <div className="p-6 text-white space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Invoice Details</h2>
                <button onClick={() => setShowDetails(false)} className="text-slate-500 hover:text-white text-2xl">&times;</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase text-slate-500">Invoice Number</p>
                  <p className="font-semibold">{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Status</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Invoice Date</p>
                  <p className="font-semibold">{formatDate(selectedInvoice.invoice_date)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Due Date</p>
                  <p className="font-semibold">{formatDate(selectedInvoice.due_date)}</p>
                </div>
              </div>

              <div className="border-t border-slate-900 pt-4">
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(selectedInvoice.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-900 pt-2">
                    <span>Total Amount</span>
                    <span>{formatCurrency(selectedInvoice.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Amount Paid</span>
                    <span>{formatCurrency(selectedInvoice.amount_paid)}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>Balance Due</span>
                    <span>{formatCurrency(selectedInvoice.balance_due)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-900 pt-4">
                <h3 className="font-semibold mb-3">Payment Status</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Status</p>
                    <p className="font-medium text-base">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPaymentBadge(selectedInvoice.payment_status)}`}>
                        {selectedInvoice.payment_status.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Method</p>
                    <p className="font-medium">{selectedInvoice.payment_method || 'N/A'}</p>
                  </div>
                </div>
                {selectedInvoice.payment_date && (
                  <div className="mt-3">
                    <p className="text-slate-500 text-sm">Payment Date</p>
                    <p className="font-medium">{formatDate(selectedInvoice.payment_date)}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-900 pt-4">
                <h3 className="font-semibold mb-3">Customer</h3>
                <p className="font-medium">{selectedInvoice.user?.full_name || 'N/A'}</p>
                <p className="text-sm text-slate-500">{selectedInvoice.user?.email || 'N/A'}</p>
              </div>

              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div className="border-t border-slate-900 pt-4">
                  <h3 className="font-semibold mb-3">Invoice Items</h3>
                  <div className="space-y-2 text-sm">
                    {selectedInvoice.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.description || item.item_name || 'Item'}</span>
                        <span>{formatCurrency(item.total || item.price || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button onClick={() => setShowDetails(false)} className="px-4 py-2 border border-slate-700 rounded-lg hover:bg-slate-900 text-slate-300">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
