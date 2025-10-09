import { useState, useEffect } from 'react';
import { CreditCard, Download, Receipt, Calendar, DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Invoice {
  id: string;
  order_number: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  billing_cycle: string;
  plan_name: string;
}

export function Billing() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    activeSubscriptions: 0,
    nextBilling: null as string | null,
  });

  useEffect(() => {
    if (user) {
      loadBillingData();
    }
  }, [user]);

  const loadBillingData = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          amount,
          status,
          payment_method,
          created_at,
          billing_cycle,
          plans (name),
          billing_cycles (name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) throw ordersError;

      const formattedInvoices = ordersData?.map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        amount: order.amount || 0,
        status: order.status,
        payment_method: order.payment_method || 'N/A',
        created_at: order.created_at,
        billing_cycle: order.billing_cycles?.name || order.billing_cycle || 'N/A',
        plan_name: order.plans?.name || 'N/A',
      })) || [];

      setInvoices(formattedInvoices);

      const completed = ordersData?.filter((o: any) => o.status === 'completed') || [];
      const totalSpent = completed.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

      const { data: serversData } = await supabase
        .from('user_servers')
        .select('id, expires_at')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      const activeSubscriptions = serversData?.length || 0;

      const activeSubs = serversData?.filter((s: any) => s.expires_at) || [];
      const nextBilling = activeSubs.length > 0
        ? activeSubs.sort((a: any, b: any) =>
            new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime()
          )[0]?.expires_at
        : null;

      setStats({
        totalSpent,
        activeSubscriptions,
        nextBilling,
      });
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'processing':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'pending':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Billing & Invoices</h1>
        <p className="text-slate-400 mt-2">Manage your payments and view billing history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-cyan-900/50 to-teal-900/50 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-400 bg-cyan-500/20 px-3 py-1 rounded-full">
              Total
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            ${stats.totalSpent.toFixed(2)}
          </div>
          <p className="text-sm text-slate-400">Total Spent</p>
        </div>

        <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="h-8 w-8 text-green-400" />
            <span className="text-sm font-semibold text-green-400 bg-green-500/20 px-3 py-1 rounded-full">
              Active
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.activeSubscriptions}
          </div>
          <p className="text-sm text-slate-400">Active Subscriptions</p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full">
              Upcoming
            </span>
          </div>
          <div className="text-lg font-bold text-white mb-1">
            {stats.nextBilling
              ? new Date(stats.nextBilling).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'No upcoming bills'
            }
          </div>
          <p className="text-sm text-slate-400">Next Billing Date</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-lg border border-cyan-500/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Payment Methods</h2>
          <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition">
            Add Payment Method
          </button>
        </div>
        <div className="text-center py-8 text-slate-400">
          <CreditCard className="h-12 w-12 mx-auto mb-3 text-slate-500" />
          <p>No payment methods added yet</p>
          <p className="text-sm mt-1">Add a payment method to enable automatic billing</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-lg border border-cyan-500/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Invoice History</h2>
          <button className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm flex items-center">
            <Download className="h-4 w-4 mr-1" />
            Download All
          </button>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Receipt className="h-12 w-12 mx-auto mb-3 text-slate-500" />
            <p>No invoices yet</p>
            <p className="text-sm mt-1">Your billing history will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Invoice</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Billing Cycle</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Receipt className="h-5 w-5 text-cyan-400 mr-2" />
                        <span className="font-mono text-sm font-semibold text-white">
                          {invoice.order_number}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-300">{invoice.plan_name}</td>
                    <td className="py-4 px-4 text-sm text-slate-300">{invoice.billing_cycle}</td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-white">
                        ${invoice.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1.5 capitalize">{invoice.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-400">
                      {new Date(invoice.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
