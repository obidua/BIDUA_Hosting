import { useState } from 'react';
import { CreditCard, Download, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export function Billing() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'payment-methods'>('invoices');

  const invoices = [
    {
      id: 'INV-2024-001',
      date: '2024-10-01',
      amount: 1299.00,
      status: 'paid',
      description: 'G.4GB - Monthly Subscription',
    },
    {
      id: 'INV-2024-002',
      date: '2024-09-01',
      amount: 1299.00,
      status: 'paid',
      description: 'G.4GB - Monthly Subscription',
    },
    {
      id: 'INV-2024-003',
      date: '2024-08-01',
      amount: 1299.00,
      status: 'paid',
      description: 'G.4GB - Monthly Subscription',
    },
  ];

  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Billing</h1>
        <p className="text-slate-400">Manage your invoices and payment methods</p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-cyan-500/30 p-4 sm:p-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Current Balance</h3>
            <p className="text-sm text-slate-400">Your account balance</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-2xl sm:text-3xl font-bold text-cyan-400">₹0.00</p>
            <p className="text-sm text-slate-400">No outstanding balance</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-cyan-500/30 overflow-hidden w-full">
        <div className="border-b border-cyan-500/30">
          <div className="flex w-full">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                activeTab === 'invoices'
                  ? 'text-cyan-400 bg-cyan-500/10 border-b-2 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-950'
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab('payment-methods')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                activeTab === 'payment-methods'
                  ? 'text-cyan-400 bg-cyan-500/10 border-b-2 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-950'
              }`}
            >
              Payment Methods
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No invoices yet</p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto -mx-4 sm:-mx-6">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-6">
                    <table className="min-w-full divide-y divide-cyan-500/30">
                      <thead>
                        <tr className="border-b border-cyan-500/30">
                          <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-300 whitespace-nowrap">Invoice ID</th>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-300 whitespace-nowrap">Date</th>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-300 whitespace-nowrap">Description</th>
                          <th className="text-right py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-300 whitespace-nowrap">Amount</th>
                          <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-300 whitespace-nowrap">Status</th>
                          <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-300 whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cyan-500/10">
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-slate-950 transition">
                            <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium text-white whitespace-nowrap">{invoice.id}</td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-slate-400 whitespace-nowrap">
                              {new Date(invoice.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-slate-400 min-w-[150px] sm:min-w-[200px]">{invoice.description}</td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white text-right whitespace-nowrap">
                              ₹{invoice.amount.toFixed(2)}
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
                              <div className="flex items-center justify-center">
                                <span
                                  className={`inline-flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                    invoice.status
                                  )}`}
                                >
                                  {getStatusIcon(invoice.status)}
                                  <span className="capitalize">{invoice.status}</span>
                                </span>
                              </div>
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
                              <div className="flex items-center justify-center">
                                <button className="inline-flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition">
                                  <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  <span className="hidden sm:inline">Download</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payment-methods' && (
            <div className="space-y-4">
              {paymentMethods.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">No payment methods added</p>
                  <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition shadow-lg shadow-cyan-500/50">
                    Add Payment Method
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-950 rounded-lg border border-cyan-500/30"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {method.brand} •••• {method.last4}
                          </p>
                          <p className="text-sm text-slate-400">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                          {method.isDefault && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {!method.isDefault && (
                          <button className="px-3 sm:px-4 py-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition">
                            Set Default
                          </button>
                        )}
                        <button className="px-3 sm:px-4 py-2 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="w-full px-6 py-3 bg-slate-950 border border-cyan-500/30 text-cyan-400 rounded-lg font-semibold hover:bg-cyan-500/10 transition">
                    Add Payment Method
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
