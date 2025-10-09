import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { getMyPayouts, requestPayout, formatCurrency, calculateTaxes, getStatusColor } from '../../lib/referral';
import { ReferralPayout, ReferralStats } from '../../types';

interface Props {
  stats: ReferralStats | null;
  onPayoutCreated: () => void;
}

export function ReferralPayoutsTab({ stats, onPayoutCreated }: Props) {
  const [payouts, setPayouts] = useState<ReferralPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [bankDetails, setBankDetails] = useState({
    account_holder: '',
    account_number: '',
    ifsc_code: '',
    bank_name: ''
  });
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      const data = await getMyPayouts();
      setPayouts(data);
    } catch (error) {
      console.error('Failed to load payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    setError('');
    const amount = parseFloat(requestAmount);

    if (isNaN(amount) || amount < 500) {
      setError('Minimum payout amount is ₹500');
      return;
    }

    if (!stats || amount > stats.available_balance) {
      setError('Insufficient balance');
      return;
    }

    if (!bankDetails.account_holder || !bankDetails.account_number || !bankDetails.ifsc_code) {
      setError('Please fill in all bank details');
      return;
    }

    setRequesting(true);

    try {
      await requestPayout(amount, paymentMethod, bankDetails);
      setShowRequestForm(false);
      setRequestAmount('');
      setBankDetails({
        account_holder: '',
        account_number: '',
        ifsc_code: '',
        bank_name: ''
      });
      await loadPayouts();
      onPayoutCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to request payout');
    } finally {
      setRequesting(false);
    }
  };

  const taxes = requestAmount ? calculateTaxes(parseFloat(requestAmount) || 0) : null;

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading payouts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Payout Requests</h3>
          <p className="text-sm text-slate-400 mt-1">
            Available Balance: <span className="text-white font-semibold">{formatCurrency(stats?.available_balance || 0)}</span>
          </p>
        </div>
        {!showRequestForm && stats && stats.can_request_payout && (
          <button
            onClick={() => setShowRequestForm(true)}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition"
          >
            Request Payout
          </button>
        )}
      </div>

      {showRequestForm && (
        <div className="bg-slate-800 rounded-lg p-6 border border-cyan-500/30">
          <h4 className="font-semibold text-white mb-4">Request New Payout</h4>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Payout Amount (₹)
              </label>
              <input
                type="number"
                min="500"
                step="1"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white"
                placeholder="500"
              />
              <p className="mt-1 text-xs text-slate-400">
                Minimum: ₹500 | Maximum: {formatCurrency(stats?.available_balance || 0)}
              </p>
            </div>

            {taxes && (
              <div className="bg-slate-900 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Amount:</span>
                  <span className="text-white font-semibold">{formatCurrency(taxes.grossAmount)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>TDS (10%):</span>
                  <span>- {formatCurrency(taxes.tdsAmount)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>GST (18%):</span>
                  <span>- {formatCurrency(taxes.serviceTaxAmount)}</span>
                </div>
                <div className="pt-2 border-t border-cyan-500/30 flex justify-between text-lg">
                  <span className="text-white font-semibold">Net Amount:</span>
                  <span className="text-green-400 font-bold">{formatCurrency(taxes.netAmount)}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                value={bankDetails.account_holder}
                onChange={(e) => setBankDetails({ ...bankDetails, account_holder: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={bankDetails.account_number}
                onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white"
                placeholder="1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                IFSC Code
              </label>
              <input
                type="text"
                value={bankDetails.ifsc_code}
                onChange={(e) => setBankDetails({ ...bankDetails, ifsc_code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white uppercase"
                placeholder="ABCD0123456"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                value={bankDetails.bank_name}
                onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white"
                placeholder="State Bank of India"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleRequestPayout}
                disabled={requesting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition disabled:opacity-50"
              >
                {requesting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                onClick={() => {
                  setShowRequestForm(false);
                  setError('');
                }}
                className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {payouts.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Payout Requests</h3>
          <p className="text-slate-400">Request a payout when your balance reaches ₹500</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payouts.map((payout) => (
            <div
              key={payout.id}
              className="bg-slate-800 rounded-lg p-4 border border-cyan-500/30"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-white">{payout.payout_number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(payout.status)}`}>
                      {payout.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-slate-400">
                    Requested: {new Date(payout.requested_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    {formatCurrency(payout.net_amount)}
                  </div>
                  <div className="text-xs text-slate-400">
                    from {formatCurrency(payout.gross_amount)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs mt-3 pt-3 border-t border-slate-700">
                <div>
                  <span className="text-slate-400">TDS:</span>
                  <span className="text-white ml-1">{formatCurrency(payout.tds_amount)}</span>
                </div>
                <div>
                  <span className="text-slate-400">GST:</span>
                  <span className="text-white ml-1">{formatCurrency(payout.service_tax_amount)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Method:</span>
                  <span className="text-white ml-1 capitalize">{payout.payment_method.replace('_', ' ')}</span>
                </div>
              </div>

              {payout.payment_reference && (
                <div className="mt-3 pt-3 border-t border-slate-700 flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-slate-400">Reference:</span>
                  <span className="text-white">{payout.payment_reference}</span>
                </div>
              )}

              {payout.rejected_reason && (
                <div className="mt-3 pt-3 border-t border-slate-700 flex items-start space-x-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-red-400 font-semibold">Rejected:</span>
                    <span className="text-slate-300 ml-1">{payout.rejected_reason}</span>
                  </div>
                </div>
              )}

              {payout.completed_at && (
                <div className="mt-3 pt-3 border-t border-slate-700 flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span className="text-slate-400">Completed:</span>
                  <span className="text-white">{new Date(payout.completed_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
