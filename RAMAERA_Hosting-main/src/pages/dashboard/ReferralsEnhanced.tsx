import { useState, useEffect } from 'react';
import { 
  Users, DollarSign, TrendingUp, Gift, Copy, Check, CreditCard, 
  Award, Clock, CheckCircle, Download, ShoppingCart
} from 'lucide-react';
import { api } from '../../lib/api';

interface AffiliateSubscription {
  id: number;
  subscription_type: string;
  amount_paid: number;
  referral_code: string;
  status: string;
  is_active: boolean;
  is_lifetime: boolean;
  activated_at: string;
}

interface AffiliateStats {
  total_referrals_level1: number;
  total_referrals_level2: number;
  total_referrals_level3: number;
  total_referrals: number;
  active_referrals: number;
  total_commission_earned: number;
  pending_commission: number;
  approved_commission: number;
  paid_commission: number;
  available_balance: number;
  total_payouts: number;
  total_payout_amount: number;
  subscription_status: string;
  referral_code: string;
  is_active: boolean;
  can_request_payout: boolean;
}

interface TeamMember {
  user_id: number;
  email: string;
  full_name: string;
  level: number;
  joined_at: string;
  has_purchased: boolean;
  total_purchases: number;
  total_commission: number;
  active_servers: number;
  child_count: number;
}

interface Commission {
  id: number;
  level: number;
  order_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  created_at: string;
  referred_user_email?: string;
  order_description?: string;
}

export function ReferralsEnhanced() {
  const [subscription, setSubscription] = useState<AffiliateSubscription | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'commissions' | 'payouts'>('overview');
  const [copied, setCopied] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Load subscription status
      const subResponse = await api.get('/api/v1/affiliate/subscription/status');
      setSubscription(subResponse);
    } catch (error: unknown) {
      // If no subscription found, show subscription modal
      console.log('No subscription found, showing modal');
      setShowSubscriptionModal(true);
    }

    try {
      // Load stats (only if subscribed)
      const statsResponse = await api.get('/api/v1/affiliate/stats');
      setStats(statsResponse);

      // Load team members
      const teamResponse = await api.get('/api/v1/affiliate/team/members');
      setTeamMembers(teamResponse);

      // Load commissions
      const commissionsResponse = await api.get('/api/v1/affiliate/commissions?limit=20');
      setCommissions(commissionsResponse);
    } catch (error: unknown) {
      console.log('Stats/Team/Commissions loading skipped - no subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      // In a real implementation, integrate with payment gateway
      const response = await api.post('/api/v1/affiliate/subscription/create', {
        payment_method: 'razorpay',
        payment_id: 'PAY_' + Date.now()
      });
      setSubscription(response);
      setShowSubscriptionModal(false);
      loadData();
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Subscription payment failed. Please try again.');
    }
  };

  const copyReferralLink = () => {
    if (stats?.referral_code) {
      const link = `${window.location.origin}/signup?ref=${stats.referral_code}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const requestPayout = async () => {
    if (!stats || stats.available_balance < 500) {
      alert('Minimum payout amount is ₹500');
      return;
    }

    try {
      await api.post('/api/v1/affiliate/payouts/request', {
        amount: stats.available_balance,
        payment_method: 'bank_transfer',
        payment_details: JSON.stringify({ account: 'Your bank details' }),
        notes: 'Payout request'
      });
      alert('Payout request submitted successfully!');
      loadData();
    } catch (error) {
      console.error('Payout request failed:', error);
      alert('Failed to request payout. Please try again.');
    }
  };

  const filterTeamByLevel = (level: number | null) => {
    setSelectedLevel(level);
  };

  const filteredTeam = selectedLevel 
    ? teamMembers.filter(m => m.level === selectedLevel)
    : teamMembers;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading affiliate dashboard...</div>
      </div>
    );
  }

  // Subscription Required Modal
  if (showSubscriptionModal && !subscription) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-slate-900 rounded-xl max-w-xl w-full border-2 border-cyan-500 p-4 sm:p-6 my-8">
          <div className="text-center mb-4 sm:mb-6">
            <Award className="h-12 w-12 sm:h-14 sm:w-14 text-cyan-400 mx-auto mb-3" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Join Our Affiliate Program</h2>
            <p className="text-slate-300 text-sm sm:text-base mb-3 sm:mb-4">
              Start earning unlimited income by referring our hosting services!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-lg p-3 sm:p-4 text-white">
              <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 mb-2 sm:mb-3" />
              <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">Buy a Server</h3>
              <p className="text-cyan-100 mb-2 text-xs sm:text-sm">Get FREE lifetime affiliate access</p>
              <div className="text-xl sm:text-2xl font-bold">₹0</div>
              <p className="text-xs text-cyan-100 mt-1">With any server purchase</p>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg p-3 sm:p-4 text-white">
              <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 mb-2 sm:mb-3" />
              <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">Direct Subscribe</h3>
              <p className="text-green-100 mb-2 text-xs sm:text-sm">One-time lifetime payment</p>
              <div className="text-xl sm:text-2xl font-bold">₹499</div>
              <p className="text-xs text-green-100 mt-1">Lifetime access</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="text-white font-bold mb-2 sm:mb-3 text-sm sm:text-base">What You Get:</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-slate-300 text-xs sm:text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>Lifetime affiliate account with unique referral code</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>Earn commissions from 3 levels of referrals (L1, L2, L3)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>Up to 15% commission on direct referrals</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>Earn on every renewal and purchase from your team</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>Track all team members and earnings in real-time</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => window.location.href = '/dashboard/servers'}
              className="w-full px-4 py-2.5 sm:py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold transition text-sm"
            >
              Buy Server (Free Access)
            </button>
            <button
              onClick={handleSubscribe}
              className="w-full px-4 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition text-sm"
            >
              Pay ₹499 & Subscribe
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto pb-6">
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Affiliate Dashboard</h1>
          <p className="text-sm sm:text-base text-slate-400">Manage your affiliate program and track your earnings</p>
        </div>

        {/* Subscription Status Banner */}
        {subscription && (
          <div className={`rounded-xl p-4 sm:p-6 border-2 ${
            subscription.subscription_type === 'free_with_server' 
              ? 'bg-gradient-to-r from-cyan-900/50 to-teal-900/50 border-cyan-500'
              : 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500'
          }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400 flex-shrink-0" />
              <div>
                <h3 className="text-white font-bold text-sm sm:text-base">
                  {subscription.subscription_type === 'free_with_server' 
                    ? 'Free Lifetime Affiliate (Server Purchase)' 
                    : 'Lifetime Affiliate Member'}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Activated on {new Date(subscription.activated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Referral Code Card */}
      <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl shadow-lg p-4 sm:p-6 border-2 border-cyan-400">
        <div className="flex items-center space-x-3 mb-4">
          <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Your Referral Code</h3>
            <p className="text-xs sm:text-sm text-cyan-100">Share this code to start earning</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-4">
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-wider text-center">
            {stats?.referral_code || 'Loading...'}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            readOnly
            value={`${window.location.origin}/signup?ref=${stats?.referral_code || ''}`}
            className="flex-1 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-xs sm:text-sm truncate min-w-0"
          />
          <button
            onClick={copyReferralLink}
            className="px-3 sm:px-4 py-2 bg-white text-cyan-600 rounded-lg font-semibold hover:bg-cyan-50 transition flex items-center justify-center space-x-2 text-sm sm:text-base whitespace-nowrap"
          >
            {copied ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <Copy className="h-4 w-4 sm:h-5 sm:w-5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 rounded-xl p-4 sm:p-6 border-2 border-cyan-500">
          <div className="flex items-center justify-between mb-3">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats?.total_referrals || 0}</div>
          <div className="text-xs sm:text-sm text-slate-400 mb-3">Total Referrals</div>
          <div className="flex justify-between text-xs pt-3 border-t border-cyan-500/30">
            <span className="text-slate-400">L1: {stats?.total_referrals_level1 || 0}</span>
            <span className="text-slate-400">L2: {stats?.total_referrals_level2 || 0}</span>
            <span className="text-slate-400">L3: {stats?.total_referrals_level3 || 0}</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 sm:p-6 border-2 border-green-500">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
            ₹{stats?.total_commission_earned?.toLocaleString() || 0}
          </div>
          <div className="text-xs sm:text-sm text-slate-400">Total Earned</div>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 sm:p-6 border-2 border-cyan-500">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
            ₹{stats?.available_balance?.toLocaleString() || 0}
          </div>
          <div className="text-xs sm:text-sm text-slate-400 mb-2">Available Balance</div>
          {stats?.can_request_payout && (
            <button
              onClick={requestPayout}
              className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition"
            >
              Request Payout
            </button>
          )}
        </div>

        <div className="bg-slate-900 rounded-xl p-4 sm:p-6 border-2 border-blue-500">
          <div className="flex items-center justify-between mb-3">
            <Download className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
            ₹{stats?.total_payout_amount?.toLocaleString() || 0}
          </div>
          <div className="text-xs sm:text-sm text-slate-400">Total Withdrawn</div>
          <div className="text-xs text-slate-500 mt-2">{stats?.total_payouts || 0} payouts</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 rounded-xl border-2 border-cyan-500 overflow-hidden">
        <div className="border-b border-cyan-500/30 overflow-x-auto">
          <div className="flex space-x-1 p-1 min-w-max">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'team', label: 'My Team', icon: Users },
              { id: 'commissions', label: 'Commissions', icon: DollarSign },
              { id: 'payouts', label: 'Payouts', icon: Download }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Commission Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-cyan-500/30">
                    <h4 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">Recurring Plans (Monthly/Quarterly/Semi-annual)</h4>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Level 1 (Direct):</span>
                        <span className="text-green-400 font-bold">5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Level 2:</span>
                        <span className="text-green-400 font-bold">1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Level 3:</span>
                        <span className="text-green-400 font-bold">1%</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-cyan-500/30 text-xs text-slate-400">
                        Earn on every renewal payment
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-4 border border-cyan-500/30">
                    <h4 className="font-semibold text-white mb-3">Long-term Plans (Annual/Biennial/Triennial)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Level 1 (Direct):</span>
                        <span className="text-green-400 font-bold">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Level 2:</span>
                        <span className="text-green-400 font-bold">3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Level 3:</span>
                        <span className="text-green-400 font-bold">2%</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-cyan-500/30 text-xs text-slate-400">
                        One-time commission
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Payout Information</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Minimum payout: ₹500</li>
                  <li>• Payouts processed within 7-10 business days</li>
                  <li>• Commissions approved automatically for verified orders</li>
                  <li>• Track all earnings in real-time</li>
                </ul>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button
                  onClick={() => filterTeamByLevel(null)}
                  className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                    selectedLevel === null
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  All Levels ({teamMembers.length})
                </button>
                <button
                  onClick={() => filterTeamByLevel(1)}
                  className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                    selectedLevel === 1
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Level 1 ({stats?.total_referrals_level1 || 0})
                </button>
                <button
                  onClick={() => filterTeamByLevel(2)}
                  className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                    selectedLevel === 2
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Level 2 ({stats?.total_referrals_level2 || 0})
                </button>
                <button
                  onClick={() => filterTeamByLevel(3)}
                  className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                    selectedLevel === 3
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Level 3 ({stats?.total_referrals_level3 || 0})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Member</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Level</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Joined</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Purchases</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Commission</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Servers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeam.map(member => (
                      <tr key={member.user_id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-white font-medium">{member.full_name}</div>
                            <div className="text-slate-400 text-sm">{member.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            member.level === 1 ? 'bg-cyan-500/20 text-cyan-400' :
                            member.level === 2 ? 'bg-blue-500/20 text-blue-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            L{member.level}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-sm">
                          {new Date(member.joined_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white font-medium">₹{member.total_purchases.toLocaleString()}</div>
                          {member.has_purchased && (
                            <div className="text-green-400 text-xs">✓ Active</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-green-400 font-bold">
                          ₹{member.total_commission.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {member.active_servers}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredTeam.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team members yet. Start referring to build your team!</p>
                </div>
              )}
            </div>
          )}

          {/* Commissions Tab */}
          {activeTab === 'commissions' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">From</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Level</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Order Amount</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Rate</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Commission</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map(comm => (
                      <tr key={comm.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-4 text-slate-300 text-sm">
                          {new Date(comm.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-sm">
                          {comm.referred_user_email || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400">
                            L{comm.level}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white">
                          ₹{comm.order_amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {comm.commission_rate}%
                        </td>
                        <td className="py-3 px-4 text-green-400 font-bold">
                          ₹{comm.commission_amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            comm.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                            comm.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {comm.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {commissions.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No commissions yet. Commissions will appear here when your referrals make purchases.</p>
                </div>
              )}
            </div>
          )}

          {/* Payouts Tab */}
          {activeTab === 'payouts' && (
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-lg p-6 text-center">
                <h3 className="text-white font-bold text-xl mb-2">Available for Withdrawal</h3>
                <div className="text-4xl font-bold text-green-400 mb-4">
                  ₹{stats?.available_balance?.toLocaleString() || 0}
                </div>
                <button
                  onClick={requestPayout}
                  disabled={!stats?.can_request_payout}
                  className={`px-6 py-3 rounded-lg font-bold transition ${
                    stats?.can_request_payout
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {stats?.can_request_payout ? 'Request Payout' : 'Minimum ₹500 Required'}
                </button>
                <p className="text-slate-400 text-sm mt-4">
                  Minimum payout: ₹500 | Processing time: 7-10 business days
                </p>
              </div>

              <div className="text-slate-400 text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Payout history will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
