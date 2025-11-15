import { DocLayout } from '../../../components/docs/DocLayout';
import { Share2, TrendingUp, DollarSign, Users, Gift, CheckCircle2, AlertTriangle } from 'lucide-react';

export function ReferralsAPI() {
  return (
    <DocLayout
      title="Referrals API"
      description="API documentation for managing referral links, tracking commissions, and handling payouts."
      breadcrumbs={[{ label: 'API' }, { label: 'Referrals' }]}
      prevPage={{ title: 'Support API', path: '/docs/api/support' }}
      nextPage={{ label: 'Documentation', path: '/docs' }}
    >
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Referrals API Overview</h2>
          <p className="text-slate-700 mb-4">
            The Referrals API enables users to create unique referral links, track referrals, manage earnings, and process payouts. Earn commissions when referred customers purchase services.
          </p>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900">Commission Structure</h3>
              <p className="text-slate-700 text-sm">10-30% commission on first payment from referred customer</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Payment Statuses</h3>
              <p className="text-slate-700 text-sm">pending, approved, paid, rejected, cancelled</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Payout Methods</h3>
              <p className="text-slate-700 text-sm">Bank Transfer, PayPal, Cryptocurrency, Credit Note</p>
            </div>
          </div>
        </section>

        {/* Get Referral Link */}
        <section>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-cyan-50 rounded-lg">
              <Share2 className="h-6 w-6 text-cyan-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Get Referral Link</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Endpoint</h3>
              <div className="bg-slate-900 rounded p-3 text-green-400 font-mono text-sm overflow-x-auto">
                GET /api/v1/referrals/link
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Headers</h3>
              <div className="bg-slate-50 rounded p-3 font-mono text-sm">
                <div className="text-slate-700">Authorization: Bearer {'{token}'}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Response (200 OK)</h3>
              <div className="bg-slate-50 rounded p-4 overflow-x-auto">
                <pre className="text-slate-700 font-mono text-sm">{`{
  "referral_code": "REF_12345ABC",
  "referral_link": "https://bidua.com?ref=REF_12345ABC",
  "short_link": "https://bid.ua/REF_12345ABC",
  "commission_rate": 15,
  "total_referrals": 5,
  "total_earnings": 245.50,
  "pending_earnings": 50.00,
  "confirmed_earnings": 195.50,
  "created_at": "2024-01-10T08:15:00Z"
}`}</pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Usage Notes</h3>
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-blue-800 text-sm">
                  Each user automatically gets a unique referral code upon signup. The referral link can be shared via social media, email, or any marketing channel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* List Referrals */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">List Your Referrals</h2>

          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Endpoint</h3>
              <div className="bg-slate-900 rounded p-3 text-green-400 font-mono text-sm overflow-x-auto">
                GET /api/v1/referrals
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Headers</h3>
              <div className="bg-slate-50 rounded p-3 font-mono text-sm">
                <div className="text-slate-700">Authorization: Bearer {'{token}'}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Query Parameters</h3>
              <div className="bg-slate-50 rounded p-3 space-y-2 text-sm text-slate-700">
                <div><span className="font-semibold">skip</span> (optional) - Number of referrals to skip (default: 0)</div>
                <div><span className="font-semibold">limit</span> (optional) - Number of referrals to return (default: 10, max: 100)</div>
                <div><span className="font-semibold">status</span> (optional) - Filter by conversion status (pending, converted, active)</div>
                <div><span className="font-semibold">sort_by</span> (optional) - Sort field (created_at, commission_amount) default: created_at</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Response (200 OK)</h3>
              <div className="bg-slate-50 rounded p-4 overflow-x-auto">
                <pre className="text-slate-700 font-mono text-sm">{`{
  "referrals": [
    {
      "id": 1,
      "referred_user": {
        "id": 25,
        "email": "customer@example.com",
        "name": "John Customer"
      },
      "order_id": 12,
      "plan_name": "VPS Professional",
      "status": "active",
      "commission_rate": 15,
      "commission_amount": 50.25,
      "order_amount": 335.00,
      "payment_status": "paid",
      "referral_date": "2024-01-10T14:30:00Z",
      "payment_date": "2024-01-15T09:00:00Z",
      "expires_at": "2025-01-10T14:30:00Z"
    },
    {
      "id": 2,
      "referred_user": {
        "id": 26,
        "email": "another@example.com",
        "name": "Jane Buyer"
      },
      "order_id": 13,
      "plan_name": "VPS Starter",
      "status": "active",
      "commission_rate": 10,
      "commission_amount": 7.31,
      "order_amount": 73.16,
      "payment_status": "pending",
      "referral_date": "2024-01-12T10:15:00Z",
      "payment_date": null,
      "expires_at": "2025-01-12T10:15:00Z"
    }
  ],
  "total": 5,
  "skip": 0,
  "limit": 10,
  "summary": {
    "total_referrals": 5,
    "active_referrals": 3,
    "total_commission": 245.50,
    "pending_commission": 50.00
  }
}`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Get Referral Details */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Get Referral Details</h2>

          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Endpoint</h3>
              <div className="bg-slate-900 rounded p-3 text-green-400 font-mono text-sm overflow-x-auto">
                GET /api/v1/referrals/{'{referral_id}'}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Headers</h3>
              <div className="bg-slate-50 rounded p-3 font-mono text-sm">
                <div className="text-slate-700">Authorization: Bearer {'{token}'}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Response (200 OK)</h3>
              <div className="bg-slate-50 rounded p-4 overflow-x-auto">
                <pre className="text-slate-700 font-mono text-sm">{`{
  "id": 1,
  "referral_code": "REF_12345ABC",
  "referred_user": {
    "id": 25,
    "email": "customer@example.com",
    "name": "John Customer",
    "country": "US",
    "signup_date": "2024-01-10T12:00:00Z"
  },
  "order": {
    "id": 12,
    "order_number": "ORD-2024-000012",
    "plan_name": "VPS Professional",
    "billing_cycle": "annual",
    "order_amount": 335.00,
    "discount_amount": 33.50,
    "tax_amount": 60.30,
    "grand_total": 361.80,
    "currency": "USD"
  },
  "commission": {
    "rate": 15,
    "amount": 50.25,
    "calculation": "361.80 * 15% = 50.25",
    "status": "paid"
  },
  "status": "active",
  "referral_date": "2024-01-10T14:30:00Z",
  "payment_date": "2024-01-15T09:00:00Z",
  "expires_at": "2025-01-10T14:30:00Z",
  "created_at": "2024-01-10T14:30:00Z"
}`}</pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Possible Errors</h3>
              <div className="space-y-2">
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="font-semibold text-red-900 text-sm">401 Unauthorized</p>
                  <p className="text-red-800 text-sm">Missing or invalid authentication token</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="font-semibold text-red-900 text-sm">403 Forbidden</p>
                  <p className="text-red-800 text-sm">You don't have permission to access this referral</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="font-semibold text-red-900 text-sm">404 Not Found</p>
                  <p className="text-red-800 text-sm">Referral with specified ID does not exist</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* List Earnings */}
        <section>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">List Earnings</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Endpoint</h3>
              <div className="bg-slate-900 rounded p-3 text-green-400 font-mono text-sm overflow-x-auto">
                GET /api/v1/referrals/earnings/summary
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Headers</h3>
              <div className="bg-slate-50 rounded p-3 font-mono text-sm">
                <div className="text-slate-700">Authorization: Bearer {'{token}'}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Query Parameters</h3>
              <div className="bg-slate-50 rounded p-3 space-y-2 text-sm text-slate-700">
                <div><span className="font-semibold">period</span> (optional) - Filter by period (week, month, year, all) default: all</div>
                <div><span className="font-semibold">status</span> (optional) - Filter by status (pending, approved, paid)</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Response (200 OK)</h3>
              <div className="bg-slate-50 rounded p-4 overflow-x-auto">
                <pre className="text-slate-700 font-mono text-sm">{`{
  "earnings": {
    "total_earnings": 245.50,
    "pending_earnings": 50.00,
    "approved_earnings": 95.50,
    "paid_earnings": 100.00,
    "currency": "USD"
  },
  "breakdown": {
    "weekly": {
      "earnings": 0.00,
      "referral_count": 0
    },
    "monthly": {
      "earnings": 50.25,
      "referral_count": 1
    },
    "yearly": {
      "earnings": 245.50,
      "referral_count": 5
    }
  },
  "history": [
    {
      "id": 1,
      "referral_id": 1,
      "amount": 50.25,
      "status": "paid",
      "payment_date": "2024-01-15T09:00:00Z",
      "description": "Commission from referral REF_12345ABC"
    },
    {
      "id": 2,
      "referral_id": 2,
      "amount": 7.31,
      "status": "pending",
      "payment_date": null,
      "description": "Commission from referral REF_12345ABC"
    }
  ]
}`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Request Payout */}
        <section>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Request Payout</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Endpoint</h3>
              <div className="bg-slate-900 rounded p-3 text-green-400 font-mono text-sm overflow-x-auto">
                POST /api/v1/referrals/payouts/request
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Headers</h3>
              <div className="bg-slate-50 rounded p-3 font-mono text-sm">
                <div className="text-slate-700">Authorization: Bearer {'{token}'}</div>
                <div className="text-slate-700">Content-Type: application/json</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Request Body</h3>
              <div className="bg-slate-50 rounded p-4 overflow-x-auto">
                <pre className="text-slate-700 font-mono text-sm">{`{
  "amount": 100.00,
  "method": "bank_transfer",
  "bank_details": {
    "account_holder": "John Doe",
    "account_number": "1234567890",
    "bank_name": "Example Bank",
    "swift_code": "EXAMPLUS33",
    "country": "US"
  }
}`}</pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Alternative Methods</h3>
              <div className="bg-slate-50 rounded p-4 space-y-3">
                <div>
                  <strong className="text-slate-900">PayPal</strong>
                  <pre className="text-slate-700 font-mono text-sm mt-1">{`{
  "method": "paypal",
  "paypal_email": "user@example.com"
}`}</pre>
                </div>
                <div>
                  <strong className="text-slate-900">Cryptocurrency</strong>
                  <pre className="text-slate-700 font-mono text-sm mt-1">{`{
  "method": "crypto",
  "crypto_type": "bitcoin",
  "wallet_address": "1A1z7agoat8Bt16TS..."
}`}</pre>
                </div>
                <div>
                  <strong className="text-slate-900">Credit Note</strong>
                  <pre className="text-slate-700 font-mono text-sm mt-1">{`{
  "method": "credit_note"
}`}</pre>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Response (201 Created)</h3>
              <div className="bg-slate-50 rounded p-4 overflow-x-auto">
                <pre className="text-slate-700 font-mono text-sm">{`{
  "id": 5,
  "payout_number": "PAYOUT-2024-000005",
  "amount": 100.00,
  "currency": "USD",
  "method": "bank_transfer",
  "status": "pending",
  "requested_at": "2024-01-15T16:30:00Z",
  "expected_completion": "2024-01-22T23:59:59Z",
  "bank_details": {
    "account_holder": "John Doe",
    "account_number": "1234567890",
    "bank_name": "Example Bank"
  },
  "notes": "Payout request submitted for review"
}`}</pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Requirements</h3>
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Minimum payout amount: $50 USD equivalent</li>
                  <li>• Must have verified email and complete profile</li>
                  <li>• Account must have been active for at least 30 days</li>
                  <li>• Processing takes 3-7 business days depending on method</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* List Payouts */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">List Your Payouts</h2>

          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Endpoint</h3>
              <div className="bg-slate-900 rounded p-3 text-green-400 font-mono text-sm overflow-x-auto">
                GET /api/v1/referrals/payouts
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Headers</h3>
              <div className="bg-slate-50 rounded p-3 font-mono text-sm">
                <div className="text-slate-700">Authorization: Bearer {'{token}'}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Query Parameters</h3>
              <div className="bg-slate-50 rounded p-3 space-y-2 text-sm text-slate-700">
                <div><span className="font-semibold">skip</span> (optional) - Number of payouts to skip (default: 0)</div>
                <div><span className="font-semibold">limit</span> (optional) - Number of payouts to return (default: 10, max: 50)</div>
                <div><span className="font-semibold">status</span> (optional) - Filter by status (pending, approved, paid, rejected)</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Response (200 OK)</h3>
              <div className="bg-slate-50 rounded p-4 overflow-x-auto">
                <pre className="text-slate-700 font-mono text-sm">{`{
  "payouts": [
    {
      "id": 5,
      "payout_number": "PAYOUT-2024-000005",
      "amount": 100.00,
      "currency": "USD",
      "method": "bank_transfer",
      "status": "paid",
      "requested_at": "2024-01-15T16:30:00Z",
      "approved_at": "2024-01-16T10:00:00Z",
      "paid_at": "2024-01-20T14:30:00Z",
      "tracking_id": "TRANSFER_ABC123"
    },
    {
      "id": 4,
      "payout_number": "PAYOUT-2024-000004",
      "amount": 95.50,
      "currency": "USD",
      "method": "paypal",
      "status": "pending",
      "requested_at": "2024-01-10T12:15:00Z",
      "approved_at": null,
      "paid_at": null
    }
  ],
  "total": 2,
  "skip": 0,
  "limit": 10
}`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Referral Tiers */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Commission Tiers</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div>
                  <h3 className="font-semibold text-slate-900">Tier 1: Starter</h3>
                  <p className="text-slate-700 text-sm">0-5 active referrals</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">10%</p>
                  <p className="text-slate-700 text-sm">commission rate</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div>
                  <h3 className="font-semibold text-slate-900">Tier 2: Professional</h3>
                  <p className="text-slate-700 text-sm">6-15 active referrals</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">15%</p>
                  <p className="text-slate-700 text-sm">commission rate</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <div>
                  <h3 className="font-semibold text-slate-900">Tier 3: Elite</h3>
                  <p className="text-slate-700 text-sm">16+ active referrals</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">20-30%</p>
                  <p className="text-slate-700 text-sm">commission rate</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Bonus:</strong> Earn additional 5% bonus on lifetime referral earnings when 10 referrals remain active for 12+ months.
              </p>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Referral Program Best Practices</h2>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Do's
              </h3>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Share referral link with genuine recommendations</li>
                <li>• Use multiple channels (email, social media, blogs)</li>
                <li>• Create helpful content around hosting benefits</li>
                <li>• Build long-term relationships with referred customers</li>
                <li>• Request payouts only after earnings are confirmed</li>
                <li>• Update payout details before requesting withdrawal</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Don'ts
              </h3>
              <ul className="text-red-800 text-sm space-y-1">
                <li>• Don't spam or send unsolicited emails</li>
                <li>• Don't use misleading or false advertising</li>
                <li>• Don't refer yourself with multiple accounts</li>
                <li>• Don't manipulate clicks or artificially inflate referrals</li>
                <li>• Don't engage in prohibited promotional activities</li>
                <li>• Don't share others' referral links as your own</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Referral Flow */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Referral Flow</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border-l-4 border-cyan-500">
                <h3 className="font-semibold text-slate-900 mb-2">1. Create Referral Link</h3>
                <p className="text-slate-700 text-sm">Get your unique referral code and share the link</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-l-4 border-blue-500">
                <h3 className="font-semibold text-slate-900 mb-2">2. Customer Uses Your Link</h3>
                <p className="text-slate-700 text-sm">Referred customer clicks link and signs up with tracking cookie</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-purple-500">
                <h3 className="font-semibold text-slate-900 mb-2">3. Customer Makes Purchase</h3>
                <p className="text-slate-700 text-sm">Customer creates order and completes payment</p>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-green-50 rounded-lg p-4 border-l-4 border-pink-500">
                <h3 className="font-semibold text-slate-900 mb-2">4. Commission Approved</h3>
                <p className="text-slate-700 text-sm">Commission calculated and marked as pending for 30 days</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg p-4 border-l-4 border-green-500">
                <h3 className="font-semibold text-slate-900 mb-2">5. Earnings Confirmed</h3>
                <p className="text-slate-700 text-sm">After 30 days, commission moves to approved balance</p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-500">
                <h3 className="font-semibold text-slate-900 mb-2">6. Request & Receive Payout</h3>
                <p className="text-slate-700 text-sm">Request payout via preferred method (Bank, PayPal, Crypto)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-8 border border-cyan-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">View Full Documentation</h2>
          <p className="text-slate-700 mb-6">
            Explore all available API endpoints and documentation resources.
          </p>
          <div className="space-y-3">
            <a
              href="/docs"
              className="inline-block px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition font-medium"
            >
              Back to Documentation →
            </a>
          </div>
        </section>
      </div>
    </DocLayout>
  );
}
