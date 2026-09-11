// import { useState, useEffect } from 'react';
// import {
//   Users, DollarSign, TrendingUp, Gift, Copy, Check,
//   Award, Download, CheckCircle
// } from 'lucide-react';
// import { api } from '../../lib/api';
// import { useAuth } from '../../contexts/AuthContext';
// import {
//   getCommissionRules,
//   getReferralStats,
//   getReferralEarnings,
//   getReferralPayouts,
//   formatCurrency,
//   getStatusColor
// } from '../../lib/referral';
// import { ReferralLandingPage } from '../../components/referrals/ReferralLandingPage';
// // Types from referral adapters
// import type { ReferralEarning as AdapterReferralEarning, ReferralPayout as AdapterReferralPayout } from '../../types';

// interface AffiliateSubscription {
//   id: number;
//   subscription_type: string;
//   amount_paid: number;
//   referral_code: string;
//   status: string;
//   is_active: boolean;
//   is_lifetime: boolean;
//   activated_at: string;
// }

// interface AffiliateStats {
//   total_referrals_level1: number;
//   total_referrals_level2: number;
//   total_referrals_level3: number;
//   total_referrals: number;
//   active_referrals: number;
//   total_commission_earned: number;
//   pending_commission: number;
//   approved_commission: number;
//   paid_commission: number;
//   available_balance: number;
//   total_payouts: number;
//   total_payout_amount: number;
//   subscription_status: string;
//   referral_code: string;
//   is_active: boolean;
//   can_request_payout: boolean;
// }

// interface TeamMember {
//   user_id: number;
//   email: string;
//   full_name: string;
//   level: number;
//   joined_at: string;
//   has_purchased: boolean;
//   total_purchases: number;
//   total_commission: number;
//   active_servers: number;
//   child_count: number;
// }

// interface Commission {
//   id: number;
//   level: number;
//   order_amount: number;
//   commission_rate: number;
//   commission_amount: number;
//   status: string;
//   created_at: string;
//   referred_user_email?: string;
//   order_description?: string;
// }

// // Adapter-based simplified legacy stats fallback
// interface LegacyReferralStats {
//   referral_code: string;
//   total_referrals: number;
//   l1_referrals: number;
//   l2_referrals: number;
//   l3_referrals: number;
//   total_earnings: number;
//   available_balance: number;
//   total_withdrawn: number;
// }

// // NOTE: Using adapter-provided types from ../../types (import removed for brevity) prevents ID mismatch issues

// export function ReferralsEnhanced() {
//   const { profile } = useAuth();
//   const [subscription, setSubscription] = useState<AffiliateSubscription | null>(null);
//   const [stats, setStats] = useState<AffiliateStats | null>(null);
//   const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
//   const [commissions, setCommissions] = useState<Commission[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [backendOffline, setBackendOffline] = useState(false);
//   const [offlineMessage, setOfflineMessage] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'commissions' | 'earnings' | 'payouts'>('overview');
//   const [copied, setCopied] = useState(false);
//   const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
//   const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
//   const [commissionRules, setCommissionRules] = useState<Array<{ id: number; level: number; value: number; type: string; product_type: string; name: string; description?: string }>>([]);
//   const [rulesLoading, setRulesLoading] = useState(false);
//   const [autoActivated, setAutoActivated] = useState(false);
//   const [legacyStats, setLegacyStats] = useState<LegacyReferralStats | null>(null);
//   const [razorpayLoaded, setRazorpayLoaded] = useState(false);
//   const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
//   const [welcomeMessage, setWelcomeMessage] = useState('');
//   // Payout request modal state
//   const [showPayoutModal, setShowPayoutModal] = useState(false);
//   const [payoutForm, setPayoutForm] = useState({
//     payout_type: 'total' as 'total' | 'individual',
//     earning_id: undefined as number | undefined,
//     amount: 0,
//     payment_method: 'bank_transfer',
//     account_number: '',
//     ifsc_code: '',
//     account_holder: '',
//     notes: ''
//   });
//   // Use relaxed ID typing (string | number) due to backend returning string IDs
//   type UIReferralEarning = Omit<AdapterReferralEarning, 'id'> & { id: string | number };
//   type UIReferralPayout = Omit<AdapterReferralPayout, 'id'> & { id: string | number };
//   const [earnings, setEarnings] = useState<UIReferralEarning[]>([]);
//   const [payouts, setPayouts] = useState<UIReferralPayout[]>([]);

//   // Pagination state
//   const [teamPage, setTeamPage] = useState(1);
//   const [commissionsPage, setCommissionsPage] = useState(1);
//   const [payoutsPage, setPayoutsPage] = useState(1);
//   const ITEMS_PER_PAGE = 5;

//   useEffect(() => {
//     loadData();

//     // Check if user just activated affiliate subscription
//     const justActivated = sessionStorage.getItem('affiliate_just_activated');
//     const storedMessage = sessionStorage.getItem('affiliate_welcome_message');

//     if (justActivated === 'true') {
//       setShowWelcomeBanner(true);
//       setWelcomeMessage(storedMessage || '🎉 Welcome to BIDUA Hosting Affiliate Program!');

//       // Clear the flags
//       sessionStorage.removeItem('affiliate_just_activated');
//       sessionStorage.removeItem('affiliate_welcome_message');

//       // Auto-hide banner after 10 seconds
//       setTimeout(() => setShowWelcomeBanner(false), 10000);
//     }
//   }, []);

//   // Load Razorpay script once
//   useEffect(() => {
//     const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]') as HTMLScriptElement | null;
//     if (existing) {
//       setRazorpayLoaded(true);
//       return;
//     }
//     const script = document.createElement('script');
//     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//     script.async = true;
//     script.onload = () => setRazorpayLoaded(true);
//     script.onerror = () => setRazorpayLoaded(false);
//     document.body.appendChild(script);
//   }, []);

//   const loadData = async () => {
//     setLoading(true);
//     setBackendOffline(false);
//     setOfflineMessage(null);
//     let currentSubscription: AffiliateSubscription | null = null;
//     try {
//       // First perform explicit health pre-check to avoid false offline from a single failing endpoint
//       try {
//         await api.get('/api/v1/health');
//       } catch (healthErr) {
//         if (healthErr instanceof Error && healthErr.message.startsWith('BACKEND_OFFLINE')) {
//           setBackendOffline(true);
//           setOfflineMessage('Backend health check failed. Please verify API on port 8000.');
//           setLoading(false);
//           return;
//         }
//       }

//       // Load subscription status
//       const subResponse = await api.get('/api/v1/affiliate/subscription/status') as AffiliateSubscription;
//       setSubscription(subResponse);
//       currentSubscription = subResponse as AffiliateSubscription;
//     } catch (error: unknown) {
//       // If no subscription found, attempt auto-activation from prior server purchase
//       try {
//         if (error instanceof Error && error.message.startsWith('BACKEND_OFFLINE')) {
//           setBackendOffline(true);
//           setOfflineMessage('Backend connection failed. Please ensure the API is running on port 8000.');
//           setLoading(false);
//           return;
//         }
//         const activateResp = await api.post('/api/v1/affiliate/subscription/activate-from-server');
//         const isSubObj = (x: unknown): x is { subscription: AffiliateSubscription } => {
//           return typeof x === 'object' && x !== null && 'subscription' in (x as Record<string, unknown>);
//         };
//         const activated: AffiliateSubscription = isSubObj(activateResp)
//           ? activateResp.subscription
//           : (activateResp as AffiliateSubscription);
//         if (activated && (activated.is_active || activated.status === 'active')) {
//           setSubscription(activated);
//           setShowSubscriptionModal(false);
//           currentSubscription = activated;
//           setAutoActivated(true);
//         } else {
//           // Fall back to subscription modal
//           console.log('No subscription found, showing modal');
//           setShowSubscriptionModal(true);
//         }
//       } catch (e: unknown) {
//         // Differentiate activation failure reasons
//         if (e instanceof Error) {
//           if (e.message.startsWith('BACKEND_OFFLINE')) {
//             setBackendOffline(true);
//             setOfflineMessage('Backend connection failed during activation.');
//             setLoading(false);
//             return;
//           }
//           // Activation endpoint responded but no server purchase met criteria
//           if (e.message.includes('No completed server purchase')) {
//             setShowSubscriptionModal(true);
//           } else {
//             setShowSubscriptionModal(true);
//           }
//         } else {
//           setShowSubscriptionModal(true);
//         }
//       }
//     }

//     try {
//       // Load stats (only if subscribed)
//       if (currentSubscription) {
//         const statsResponse = await api.get('/api/v1/affiliate/stats') as AffiliateStats;
//         setStats(statsResponse);

//         // Load team members
//         const teamResponse = await api.get('/api/v1/affiliate/team/members') as TeamMember[];
//         setTeamMembers(teamResponse);

//         // Load commissions
//         const commissionsResponse = await api.get('/api/v1/affiliate/commissions?limit=50') as Commission[];
//         setCommissions(commissionsResponse);

//         // Load commission rules dynamically (server product_type)
//         setRulesLoading(true);
//         try {
//           const rules = await getCommissionRules('server');
//           setCommissionRules(rules);
//         } catch (e) {
//           console.warn('Failed to load commission rules', e);
//         } finally {
//           setRulesLoading(false);
//         }

//         // Adapter-based stats fallback + earnings + payouts
//         try {
//           const mapped = await getReferralStats();
//           if (mapped) {
//             setLegacyStats({
//               referral_code: mapped.referral_code || '',
//               total_referrals: mapped.total_referrals || 0,
//               l1_referrals: mapped.l1_referrals || 0,
//               l2_referrals: mapped.l2_referrals || 0,
//               l3_referrals: mapped.l3_referrals || 0,
//               total_earnings: mapped.total_earnings || 0,
//               available_balance: mapped.available_balance || 0,
//               total_withdrawn: mapped.total_withdrawn || 0
//             });
//           }
//         } catch (statsErr) { console.warn('Referral stats adapter failed', statsErr); }
//         try {
//           const earn = await getReferralEarnings();
//           setEarnings((earn as AdapterReferralEarning[]).map(e => ({ ...e, id: e.id as string | number })));
//         } catch (earnErr) { console.warn('Referral earnings fetch failed', earnErr); }
//         try {
//           const ph = await getReferralPayouts();
//           setPayouts((ph as AdapterReferralPayout[]).map(p => ({ ...p, id: p.id as string | number })));
//         } catch (payoutErr) { console.warn('Referral payouts fetch failed', payoutErr); }
//       }
//     } catch {
//       console.log('Stats/Team/Commissions loading skipped - no subscription');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubscribe = async () => {
//     try {
//       // Create payment order for ₹499 subscription
//       const paymentOrderResponse = await api.post('/api/v1/payments/create-order', {
//         payment_type: 'subscription'
//       }) as any;

//       if (!paymentOrderResponse?.success) {
//         throw new Error('Failed to create payment order');
//       }

//       const { payment } = paymentOrderResponse;

//       // Ensure Razorpay loaded
//       if (!razorpayLoaded || !(window as any).Razorpay) {
//         alert('Payment system is loading. Please try again in a moment.');
//         return;
//       }

//       const options = {
//         key: (import.meta as any).env?.VITE_RAZORPAY_KEY_ID,
//         amount: payment.total_amount * 100, // paise
//         currency: payment.currency || 'INR',
//         name: 'BIDUA Hosting',
//         description: 'Affiliate Premium Subscription (₹499)',
//         order_id: payment.razorpay_order_id,
//         handler: async (response: any) => {
//           try {
//             // Verify payment on backend
//             const verificationResponse = await api.post('/api/v1/payments/verify-payment', {
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature
//             }) as any;

//             if (!verificationResponse?.success) {
//               throw new Error('Payment verification failed');
//             }

//             // Show success message
//             const welcomeMessage = verificationResponse.affiliate?.message ||
//               '🎉 Payment successful! Welcome to BIDUA Hosting Affiliate Program!';

//             // Store success state in sessionStorage to show welcome banner
//             sessionStorage.setItem('affiliate_just_activated', 'true');
//             sessionStorage.setItem('affiliate_welcome_message', welcomeMessage);

//             // Reload the page to show the affiliate dashboard
//             window.location.reload();
//           } catch (err: any) {
//             console.error('Payment verification/subscription error:', err);
//             const errorMsg = err?.message || 'Payment verification failed';
//             alert(`❌ ${errorMsg}\n\nPlease contact support if the payment was deducted.`);
//           }
//         },
//         modal: {
//           ondismiss: () => {
//             // User cancelled payment
//             console.log('Subscription payment cancelled by user');
//           }
//         },
//         theme: { color: '#06b6d4' }
//       };

//       const razorpay = new (window as any).Razorpay(options);
//       razorpay.on('payment.failed', (resp: any) => {
//         console.error('Payment failed:', resp?.error);
//         alert(resp?.error?.description || 'Payment failed');
//       });
//       razorpay.open();
//     } catch (error: any) {
//       console.error('Subscription initiation failed:', error);
//       alert(error?.message || 'Failed to initiate payment');
//     }
//   };

//   const copyReferralLink = () => {
//     const code = stats?.referral_code || legacyStats?.referral_code;
//     if (code) {
//       const link = `${window.location.origin}/signup?ref=${code}`;
//       navigator.clipboard.writeText(link);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   const openPayoutModal = (isTotal: boolean = false, amount?: number) => {
//     // Calculate available balance based on approved commission minus what's been paid
//     // approved_commission represents earnings that are ready for payout
//     const approvedAmount = Number(stats?.approved_commission || 0);
//     const paidAmount = Number(stats?.paid_commission || stats?.total_payout_amount || 0);
//     const calculatedBalance = approvedAmount - paidAmount;

//     // Use the calculated balance or fallback to stats.available_balance
//     // Prefer calculated balance as it's more accurate
//     const availableBalance = Number(calculatedBalance > 0 ? calculatedBalance : (stats?.available_balance || 0));

//     console.log('Payout Modal Debug:', {
//       approved_commission: stats?.approved_commission,
//       paid_commission: stats?.paid_commission,
//       total_payout_amount: stats?.total_payout_amount,
//       calculatedBalance,
//       availableBalance,
//       stats_available_balance: stats?.available_balance
//     });

//     if (isTotal && (!stats || availableBalance < 500)) {
//       alert('Minimum total payout amount is ₹500. Your current balance: ₹' + availableBalance.toFixed(2));
//       return;
//     }
//     if (isTotal && availableBalance > 20000) {
//       alert('Maximum payout per day is ₹20,000. Please request ₹20,000 or contact support for higher amounts.');
//       return;
//     }
//     // Set form amount and payout type
//     const payoutAmount = isTotal ? Math.min(availableBalance, 20000) : (amount || availableBalance);
//     const payout_type = isTotal ? 'total' : 'individual';

//     setPayoutForm(prev => ({
//       ...prev,
//       payout_type,
//       earning_id: isTotal ? undefined : (amount ? undefined : prev.earning_id), // For individual, earning_id set elsewhere
//       amount: payoutAmount,
//       account_holder: profile?.full_name || '',
//       notes: isTotal ? 'Total available balance payout request' : prev.notes
//     }));
//     setShowPayoutModal(true);
//   };

//   const requestPayout = async () => {
//     if (!payoutForm.amount || payoutForm.amount <= 0) {
//       alert('Please enter a valid payout amount');
//       return;
//     }
//     // Only check minimum for total balance requests (when notes contain 'Total available')
//     if (payoutForm.notes.includes('Total available') && payoutForm.amount < 500) {
//       alert('Minimum total payout amount is ₹500');
//       return;
//     }
//     if (payoutForm.amount > 20000) {
//       alert('Maximum payout per day is ₹20,000');
//       return;
//     }
//     if (!payoutForm.account_number || !payoutForm.ifsc_code || !payoutForm.account_holder) {
//       alert('Please fill in all bank account details');
//       return;
//     }

//     try {
//       const payment_details = JSON.stringify({
//         account_number: payoutForm.account_number,
//         ifsc_code: payoutForm.ifsc_code,
//         account_holder: payoutForm.account_holder
//       });

//       await api.post('/api/v1/affiliate/payouts/request', {
//         payout_type: payoutForm.payout_type,
//         earning_id: payoutForm.earning_id,
//         amount: payoutForm.amount,
//         payment_method: payoutForm.payment_method,
//         payment_details,
//         notes: payoutForm.notes || 'Referral commission payout request',
//         apply_tds: true,   // Apply TDS by default
//         tds_rate: 10       // 10% TDS as per Indian tax regulations
//       });

//       setShowPayoutModal(false);
//       alert('✅ Payout request submitted successfully! Admin will review and process it.');

//       // Reset form
//       setPayoutForm({
//         payout_type: 'total',
//         earning_id: undefined,
//         amount: 0,
//         payment_method: 'bank_transfer',
//         account_number: '',
//         ifsc_code: '',
//         account_holder: '',
//         notes: ''
//       });

//       loadData();
//     } catch (error: any) {
//       console.error('Payout request failed:', error);

//       // Show detailed error message from backend if available
//       let errorMessage = '❌ Failed to request payout.';
//       if (error?.response?.data?.detail) {
//         errorMessage = `❌ ${error.response.data.detail}`;
//       } else if (error?.message) {
//         errorMessage = `❌ ${error.message}`;
//       }

//       alert(errorMessage);
//       console.log('Full error details:', error?.response?.data || error);
//     }
//   };

//   const filterTeamByLevel = (level: number | null) => {
//     setSelectedLevel(level);
//     setTeamPage(1); // Reset to first page when filter changes
//   };

//   // Pagination helper functions
//   const getPaginatedData = <T,>(data: T[], currentPage: number, itemsPerPage: number): T[] => {
//     const startIdx = (currentPage - 1) * itemsPerPage;
//     const endIdx = startIdx + itemsPerPage;
//     return data.slice(startIdx, endIdx);
//   };

//   const getTotalPages = (totalItems: number, itemsPerPage: number): number => {
//     return Math.ceil(totalItems / itemsPerPage);
//   };

//   // Pagination Controls Component
//   const PaginationControls = ({
//     currentPage,
//     totalPages,
//     onPageChange
//   }: {
//     currentPage: number;
//     totalPages: number;
//     onPageChange: (page: number) => void;
//   }) => {
//     if (totalPages <= 1) return null;

//     return (
//       <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700 bg-slate-900/50">
//         <button
//           onClick={() => onPageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
//         >
//           Previous
//         </button>
//         <span className="text-slate-300 text-sm font-medium">
//           Page {currentPage} of {totalPages}
//         </span>
//         <button
//           onClick={() => onPageChange(currentPage + 1)}
//           disabled={currentPage >= totalPages}
//           className="px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
//         >
//           Next
//         </button>
//       </div>
//     );
//   };

//   const filteredTeam = selectedLevel
//     ? teamMembers.filter(m => m.level === selectedLevel)
//     : teamMembers;

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-slate-400">Loading affiliate dashboard...</div>
//       </div>
//     );
//   }

//   if (backendOffline) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center space-y-3 max-w-md">
//           <div className="text-red-400 font-semibold text-lg">Backend Unreachable</div>
//           <div className="text-slate-300 text-sm">{offlineMessage || 'Health check + fallback host failed.'}</div>
//           <ul className="text-xs text-slate-400 space-y-1 text-left mx-auto list-disc list-inside">
//             <li>Confirm uvicorn running on port 8000</li>
//             <li>Check no firewall/VPN blocks localhost</li>
//             <li>Verify VITE_API_URL env var (currently defaulting to localhost)</li>
//           </ul>
//           <button
//             onClick={loadData}
//             className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold"
//           >Retry</button>
//         </div>
//       </div>
//     );
//   }

//   // Show Landing Page for Non-Subscribers
//   if (showSubscriptionModal && !subscription) {
//     return (
//       <ReferralLandingPage
//         onSubscribe={handleSubscribe}
//         onBuyServer={() => window.location.href = '/dashboard/servers'}
//       />
//     );
//   }

//   // ✅ Calculate Total Earned from L1 + L2 + L3 if available
//   const totalFromLevels = ['L1', 'L2', 'L3'].reduce((sum, level) => {
//     return sum + (stats?.commission_by_level?.[level]?.total || 0);
//   }, 0);

//   const totalEarned =
//     totalFromLevels ||
//     stats?.total_commission_earned ||
//     legacyStats?.total_earnings ||
//     0;

//   // Calculate actual available balance (approved - paid)
//   const approvedAmount = stats?.approved_commission || 0;
//   const paidAmount = stats?.paid_commission || stats?.total_payout_amount || 0;
//   const calculatedAvailableBalance = approvedAmount - paidAmount;

//   // ALWAYS ensure balance is never negative
//   const displayAvailableBalance = Math.max(0,
//     calculatedAvailableBalance > 0 ? calculatedAvailableBalance : (stats?.available_balance || 0)
//   );

//   // Debug logging
//   console.log('Stats Debug:', {
//     total_commission_earned: stats?.total_commission_earned,
//     approved_commission: stats?.approved_commission,
//     pending_commission: stats?.pending_commission,
//     paid_commission: stats?.paid_commission,
//     total_payout_amount: stats?.total_payout_amount,
//     stats_available_balance: stats?.available_balance,
//     calculatedAvailableBalance,
//     displayAvailableBalance
//   });

//   return (
//     <div className="w-full h-full overflow-y-auto pb-6">
//       <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
//         {/* Welcome Banner - Show after successful activation */}
//         {showWelcomeBanner && (
//           <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 sm:p-6 border-2 border-green-400 shadow-xl animate-pulse">
//             <div className="flex items-start gap-4">
//               <Award className="h-8 w-8 sm:h-12 sm:w-12 text-white flex-shrink-0" />
//               <div className="flex-1">
//                 <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
//                   Welcome to the Affiliate Program! 🎉
//                 </h3>
//                 <p className="text-white/90 mb-3 text-sm sm:text-base">
//                   {welcomeMessage}
//                 </p>
//                 <div className="flex flex-col sm:flex-row gap-2 text-xs sm:text-sm text-white/80">
//                   <span>✅ Your referral code is ready</span>
//                   <span className="hidden sm:inline">•</span>
//                   <span>✅ Start sharing and earning today</span>
//                   <span className="hidden sm:inline">•</span>
//                   <span>✅ Track all earnings in real-time</span>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setShowWelcomeBanner(false)}
//                 className="text-white/80 hover:text-white transition flex-shrink-0"
//               >
//                 <Check className="h-6 w-6" />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div className="mb-4 sm:mb-6">
//           <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Affiliate Dashboard</h1>
//           <p className="text-sm sm:text-base text-slate-400">Manage your affiliate program and track your earnings</p>
//         </div>

//         {/* Subscription Status Banner */}
//         {subscription && (
//           <div className={`rounded-xl p-4 sm:p-6 border-2 ${subscription.subscription_type === 'free_with_server'
//             ? 'bg-gradient-to-r from-cyan-900/50 to-teal-900/50 border-cyan-500'
//             : 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500'
//             }`}>
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//               <div className="flex items-center gap-3 sm:gap-4">
//                 <Award className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400 flex-shrink-0" />
//                 <div>
//                   <h3 className="text-white font-bold text-sm sm:text-base">
//                     {subscription.subscription_type === 'free_with_server'
//                       ? 'Free Lifetime Affiliate (Server Purchase)'
//                       : 'Lifetime Affiliate Member'}
//                   </h3>
//                   <p className="text-slate-300 text-xs sm:text-sm">
//                     Activated on {new Date(subscription.activated_at).toLocaleDateString()}
//                   </p>
//                   {profile?.referred_by && (
//                     <p className="text-cyan-300 text-xs mt-1">Sponsor ID: {profile.referred_by}</p>
//                   )}
//                   {autoActivated && (
//                     <p className="text-green-400 text-xs mt-1">Automatically activated from your server purchase 🎉</p>
//                   )}
//                 </div>
//               </div>
//               <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 flex-shrink-0" />
//             </div>
//           </div>
//         )}

//         {/* Referral Code Card */}
//         <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl shadow-lg p-4 sm:p-6 border-2 border-cyan-400">
//           <div className="flex items-center space-x-3 mb-4">
//             <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
//             <div>
//               <h3 className="text-base sm:text-lg font-bold text-white">Your Referral Code</h3>
//               <p className="text-xs sm:text-sm text-cyan-100">Share this code to start earning</p>
//             </div>
//           </div>

//           <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-4">
//             <div className="text-2xl sm:text-3xl font-bold text-white tracking-wider text-center">
//               {stats?.referral_code || legacyStats?.referral_code || 'Loading...'}
//             </div>
//           </div>

//           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
//             <input
//               type="text"
//               readOnly
//               value={`${window.location.origin}/signup?ref=${stats?.referral_code || legacyStats?.referral_code || ''}`}
//               className="flex-1 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-xs sm:text-sm truncate min-w-0"
//             />
//             <button
//               onClick={copyReferralLink}
//               className="px-3 sm:px-4 py-2 bg-white text-cyan-600 rounded-lg font-semibold hover:bg-cyan-50 transition flex items-center justify-center space-x-2 text-sm sm:text-base whitespace-nowrap"
//             >
//               {copied ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <Copy className="h-4 w-4 sm:h-5 sm:w-5" />}
//               <span>{copied ? 'Copied!' : 'Copy'}</span>
//             </button>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
//           <div className="bg-slate-900 rounded-xl p-4 sm:p-6 border-2 border-cyan-500">
//             <div className="flex items-center justify-between mb-3">
//               <Users className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
//             </div>
//             <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats?.total_referrals || legacyStats?.total_referrals || 0}</div>
//             <div className="text-xs sm:text-sm text-slate-400 mb-3">Total Referrals</div>
//             <div className="flex justify-between text-xs pt-3 border-t border-cyan-500/30">
//               <span className="text-slate-400">L1: {stats?.total_referrals_level1 || legacyStats?.l1_referrals || 0}</span>
//               <span className="text-slate-400">L2: {stats?.total_referrals_level2 || legacyStats?.l2_referrals || 0}</span>
//               <span className="text-slate-400">L3: {stats?.total_referrals_level3 || legacyStats?.l3_referrals || 0}</span>
//             </div>
//           </div>

//           <div className="bg-slate-900 rounded-xl p-4 sm:p-6 border-2 border-green-500">
//             <div className="flex items-center justify-between mb-3">
//               <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
//             </div>
//             <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
//               ₹{totalEarned.toLocaleString()}
//             </div>
//             <div className="text-xs sm:text-sm text-slate-400 mb-3">Total Earned</div>
//             {stats?.commission_by_level && Object.keys(stats.commission_by_level).length > 0 && (
//               <div className="flex justify-between text-xs pt-3 border-t border-green-500/30">
//                 {['L1', 'L2', 'L3'].map(level => (
//                   <span key={level} className="text-slate-400">
//                     {level}: ₹{stats.commission_by_level?.[level]?.total?.toLocaleString() || 0}
//                   </span>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="bg-slate-900 rounded-xl p-4 sm:p-6 border-2 border-cyan-500">
//             <div className="flex items-center justify-between mb-3">
//               <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
//             </div>
//             <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
//               ₹{displayAvailableBalance.toLocaleString()}
//             </div>
//             <div className="text-xs sm:text-sm text-slate-400 mb-2">Available Balance</div>
//             {displayAvailableBalance !== stats?.available_balance && calculatedAvailableBalance !== displayAvailableBalance && (
//               <div className="text-xs text-yellow-400 mb-2">Calculated: ₹{Math.max(0, calculatedAvailableBalance).toFixed(2)} (Backend: ₹{stats?.available_balance || 0})</div>
//             )}
//             {displayAvailableBalance >= 500 && (
//               <button
//                 onClick={() => openPayoutModal(true)}
//                 className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition"
//               >
//                 Request Payout
//               </button>
//             )}
//           </div>

//           <div className="bg-slate-900 rounded-xl p-4 sm:p-6 border-2 border-blue-500">
//             <div className="flex items-center justify-between mb-3">
//               <Download className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
//             </div>
//             <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
//               ₹{stats?.total_payout_amount?.toLocaleString() || legacyStats?.total_withdrawn?.toLocaleString() || 0}
//             </div>
//             <div className="text-xs sm:text-sm text-slate-400">Total Withdrawn</div>
//             <div className="text-xs text-slate-500 mt-2">{stats?.total_payouts || 0} payouts</div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-slate-900 rounded-xl border-2 border-cyan-500 overflow-hidden">
//           <div className="border-b border-cyan-500/30 overflow-x-auto">
//             <div className="flex space-x-1 p-1 min-w-max">
//               {[
//                 { id: 'overview', label: 'Overview', icon: TrendingUp },
//                 { id: 'team', label: 'My Team', icon: Users },
//                 { id: 'commissions', label: 'Commissions', icon: DollarSign },
//                 { id: 'earnings', label: 'Earnings', icon: TrendingUp },
//                 { id: 'payouts', label: 'Payouts', icon: Download }
//               ].map(tab => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id as typeof activeTab)}
//                   className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${activeTab === tab.id
//                     ? 'bg-cyan-600 text-white'
//                     : 'text-slate-400 hover:text-white hover:bg-slate-800'
//                     }`}
//                 >
//                   <tab.icon className="h-4 w-4" />
//                   <span className="hidden sm:inline">{tab.label}</span>
//                   <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="p-4 sm:p-6">
//             {/* Overview Tab */}
//             {activeTab === 'overview' && (
//               <div className="space-y-4 sm:space-y-6">
//                 <div>
//                   <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Commission Structure (Dynamic)</h3>
//                   {rulesLoading && (
//                     <div className="text-xs text-slate-400 mb-2">Loading commission rules...</div>
//                   )}
//                   {!rulesLoading && commissionRules.length === 0 && (
//                     <div className="text-xs text-slate-500 mb-4">No active commission rules found. Default percentages may apply.</div>
//                   )}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
//                     {[1, 2, 3].map(level => {
//                       const rulesForLevel = commissionRules.filter(r => r.level === level);
//                       return (
//                         <div key={level} className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-cyan-500/30">
//                           <h4 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">Level {level}</h4>
//                           {rulesForLevel.length === 0 && (
//                             <div className="text-xs text-slate-500">No rule configured.</div>
//                           )}
//                           <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
//                             {rulesForLevel.map(rule => (
//                               <div key={rule.id} className="flex justify-between">
//                                 <span className="text-slate-400 truncate" title={rule.description || rule.name}>{rule.name}</span>
//                                 <span className="text-green-400 font-bold">
//                                   {rule.type === 'percentage' ? `${rule.value}%` : `₹${rule.value}`}
//                                 </span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
//                   <h4 className="font-semibold text-white mb-2">Payout Information</h4>
//                   <ul className="space-y-2 text-sm text-slate-300">
//                     <li>• Minimum payout: ₹500</li>
//                     <li>• Payouts processed within 7-10 business days</li>
//                     <li>• Commissions approved automatically for verified orders</li>
//                     <li>• Track all earnings in real-time</li>
//                   </ul>
//                 </div>
//               </div>
//             )}

//             {/* Team Tab */}
//             {activeTab === 'team' && (
//               <div className="space-y-4">
//                 <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
//                   <button
//                     onClick={() => filterTeamByLevel(null)}
//                     className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${selectedLevel === null
//                       ? 'bg-cyan-600 text-white'
//                       : 'bg-slate-800 text-slate-400 hover:text-white'
//                       }`}
//                   >
//                     All Levels ({teamMembers.length})
//                   </button>
//                   <button
//                     onClick={() => filterTeamByLevel(1)}
//                     className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${selectedLevel === 1
//                       ? 'bg-cyan-600 text-white'
//                       : 'bg-slate-800 text-slate-400 hover:text-white'
//                       }`}
//                   >
//                     Level 1 ({stats?.total_referrals_level1 || 0})
//                   </button>
//                   <button
//                     onClick={() => filterTeamByLevel(2)}
//                     className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${selectedLevel === 2
//                       ? 'bg-cyan-600 text-white'
//                       : 'bg-slate-800 text-slate-400 hover:text-white'
//                       }`}
//                   >
//                     Level 2 ({stats?.total_referrals_level2 || 0})
//                   </button>
//                   <button
//                     onClick={() => filterTeamByLevel(3)}
//                     className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${selectedLevel === 3
//                       ? 'bg-cyan-600 text-white'
//                       : 'bg-slate-800 text-slate-400 hover:text-white'
//                       }`}
//                   >
//                     Level 3 ({stats?.total_referrals_level3 || 0})
//                   </button>
//                 </div>

//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="border-b border-slate-700">
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">Member</th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">Level</th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">Joined</th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">Purchases</th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">Commission</th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">Servers</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {getPaginatedData(filteredTeam, teamPage, ITEMS_PER_PAGE).map(member => (
//                         <tr key={member.user_id} className="border-b border-slate-800 hover:bg-slate-800/50">
//                           <td className="py-3 px-4">
//                             <div>
//                               <div className="text-white font-medium">{member.full_name}</div>
//                               <div className="text-slate-400 text-sm">{member.email}</div>
//                             </div>
//                           </td>
//                           <td className="py-3 px-4">
//                             <span className={`px-2 py-1 rounded-full text-xs font-semibold ${member.level === 1 ? 'bg-cyan-500/20 text-cyan-400' :
//                               member.level === 2 ? 'bg-blue-500/20 text-blue-400' :
//                                 'bg-purple-500/20 text-purple-400'
//                               }`}>
//                               L{member.level}
//                             </span>
//                           </td>
//                           <td className="py-3 px-4 text-slate-300 text-sm">
//                             {new Date(member.joined_at).toLocaleDateString()}
//                           </td>
//                           <td className="py-3 px-4">
//                             <div className="text-white font-medium">₹{member.total_purchases.toLocaleString()}</div>
//                             {member.has_purchased && (
//                               <div className="text-green-400 text-xs">✓ Active</div>
//                             )}
//                           </td>
//                           <td className="py-3 px-4 text-green-400 font-bold">
//                             ₹{member.total_commission.toLocaleString()}
//                           </td>
//                           <td className="py-3 px-4 text-slate-300">
//                             {member.active_servers}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   {filteredTeam.length > ITEMS_PER_PAGE && (
//                     <PaginationControls
//                       currentPage={teamPage}
//                       totalPages={getTotalPages(filteredTeam.length, ITEMS_PER_PAGE)}
//                       onPageChange={setTeamPage}
//                     />
//                   )}
//                 </div>

//                 {filteredTeam.length === 0 && (
//                   <div className="text-center py-12 text-slate-400">
//                     <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                     <p>No team members yet. Start referring to build your team!</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Commissions Tab */}
//             {activeTab === 'commissions' && (
//               <div className="bg-slate-950/60 rounded-lg p-6 border border-slate-900">
//                 <h3 className="text-xl font-semibold text-white mb-4">Commission History</h3>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full">
//                     <thead className="bg-slate-950/70">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Level</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Order Amount</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rate</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Commission</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-slate-950/60 divide-y divide-gray-700">
//                       {getPaginatedData(
//                         commissions.filter(comm => comm.status !== 'paid' && comm.status !== 'completed'),
//                         commissionsPage,
//                         ITEMS_PER_PAGE
//                       ).map(comm => (
//                         <tr key={comm.id}>
//                           <td className="px-4 py-3 text-sm text-white">
//                             <span className={`px-2 py-1 rounded-full text-xs font-semibold ${comm.level === 1 ? 'bg-green-100 text-green-800' :
//                               comm.level === 2 ? 'bg-blue-100 text-blue-800' :
//                                 'bg-purple-100 text-purple-800'
//                               }`}>
//                               L{comm.level}
//                             </span>
//                           </td>
//                           <td className="px-4 py-3 text-sm text-white">₹{comm.order_amount?.toFixed(2)}</td>
//                           <td className="px-4 py-3 text-sm text-white">{comm.commission_rate}%</td>
//                           <td className="px-4 py-3 text-sm font-bold text-green-600">₹{comm.commission_amount?.toFixed(2)}</td>
//                           <td className="px-4 py-3 text-sm">
//                             <span className={`px-2 py-1 rounded-full text-xs font-semibold ${comm.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                               comm.status === 'approved' ? 'bg-green-100 text-green-800' :
//                                 'bg-gray-100 text-gray-800'
//                               }`}>
//                               {comm.status}
//                             </span>
//                           </td>
//                           <td className="px-4 py-3 text-sm text-slate-500">
//                             {comm.earned_at ? new Date(comm.earned_at).toLocaleDateString() : 'N/A'}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   {commissions.filter(comm => comm.status !== 'paid' && comm.status !== 'completed').length > ITEMS_PER_PAGE && (
//                     <PaginationControls
//                       currentPage={commissionsPage}
//                       totalPages={getTotalPages(
//                         commissions.filter(comm => comm.status !== 'paid' && comm.status !== 'completed').length,
//                         ITEMS_PER_PAGE
//                       )}
//                       onPageChange={setCommissionsPage}
//                     />
//                   )}
//                 </div>

//                 {commissions.filter(comm => comm.status !== 'paid' && comm.status !== 'completed').length === 0 && (
//                   <div className="text-center py-12 text-slate-500">
//                     <p>No commissions yet. Commissions will appear here when your referrals make purchases.</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Earnings Tab */}
//             {activeTab === 'earnings' && (
//               <div className="space-y-4">
//                 {/* Request Total Payout Button */}
//                 {stats && (() => {
//                   const calculatedBalance = totalEarned - (stats.paid_commission || stats.total_payout_amount || 0);
//                   return (
//                     <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-2 border-green-500 rounded-xl p-4">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <h3 className="text-white font-bold text-lg mb-1">Request Total Payout</h3>
//                           <p className="text-green-300 text-sm">
//                             Available Balance: ₹{calculatedBalance.toLocaleString()}
//                           </p>
//                           <p className="text-xs text-slate-400 mt-1">
//                             Total Earned: ₹{totalEarned.toLocaleString()} | Already Paid: ₹{(stats.paid_commission || stats.total_payout_amount || 0).toLocaleString()}
//                           </p>
//                           <p className="text-xs text-slate-400">Min: ₹500 | Max per day: ₹20,000</p>
//                         </div>
//                         <button
//                           onClick={() => openPayoutModal(true)}
//                           disabled={calculatedBalance < 500}
//                           className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-500 hover:to-emerald-500 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                           Request Total Payout
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })()}
//                 {/* Filter earnings to exclude 'paid' status - those should only show in Payouts tab */}
//                 {earnings.filter(e => (e as any).status !== 'paid').length === 0 && (
//                   <div className="text-center py-12 text-slate-400">
//                     <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                     <p>No pending or approved earnings. Paid earnings are shown in the Payouts tab.</p>
//                   </div>
//                 )}
//                 {earnings
//                   .filter(e => (e as any).status !== 'paid') // Only show pending and approved earnings
//                   .map(e => (
//                     <div key={String(e.id)} className="bg-slate-800 rounded-lg p-4 border border-cyan-500/30">
//                       <div className="flex justify-between mb-2">
//                         <div>
//                           <div className="text-white font-semibold">Level {e.level} Commission</div>
//                           <div className="text-xs text-slate-400">{new Date(e.created_at).toLocaleString()}</div>
//                         </div>
//                         <div className="text-right">
//                           <div className="text-green-400 font-bold text-lg">+{formatCurrency(e.commission_amount)}</div>
//                           <div className="text-xs text-slate-500">Order: {formatCurrency(e.order_amount)}</div>
//                         </div>
//                       </div>
//                       <div className="flex items-center justify-between pt-2 border-t border-slate-700 text-xs">
//                         <div className="flex items-center gap-2">
//                           <span className="text-slate-400">Rate: {e.commission_percentage}%</span>
//                           {e.is_recurring && (
//                             <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">Recurring</span>
//                           )}
//                           <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${(e as any).status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
//                             (e as any).status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
//                               'bg-slate-500/20 text-slate-400 border border-slate-500/30'
//                             }`}>
//                             {(e as any).status || 'pending'}
//                           </span>
//                         </div>
//                         {((e as any).status === 'approved' || !(e as any).status) && (
//                           <button
//                             onClick={() => {
//                               setPayoutForm({
//                                 ...payoutForm,
//                                 payout_type: 'individual',
//                                 earning_id: Number(e.id),
//                                 amount: e.commission_amount,
//                                 notes: `Payout request for Level ${e.level} commission (Order: ${formatCurrency(e.order_amount)})`
//                               });
//                               setShowPayoutModal(true);
//                             }}
//                             className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition"
//                           >
//                             Request Payout
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//               </div>
//             )}

//             {/* Payouts Tab */}
//             {activeTab === 'payouts' && (
//               <div className="space-y-6">
//                 {stats?.can_request_payout && (
//                   <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 border-2 border-green-400">
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <h3 className="text-lg font-bold text-white mb-2">Ready for Payout!</h3>
//                         <p className="text-green-100 mb-3">
//                           You have {formatCurrency((stats?.available_balance || legacyStats?.available_balance || 0))} available for withdrawal
//                         </p>
//                         <div className="grid grid-cols-3 gap-2 text-xs text-green-100">
//                           <div>TDS (10%): {formatCurrency((stats?.available_balance || legacyStats?.available_balance || 0) * 0.10)}</div>
//                           <div>GST (18%): {formatCurrency((stats?.available_balance || legacyStats?.available_balance || 0) * 0.18)}</div>
//                           <div className="font-semibold">Net: {formatCurrency((stats?.available_balance || legacyStats?.available_balance || 0) * 0.72)}</div>
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => openPayoutModal(true)}
//                         className="px-5 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition"
//                       >
//                         Request Payout
//                       </button>
//                     </div>
//                   </div>
//                 )}
//                 {payouts.length === 0 ? (
//                   <div className="text-center py-12 text-slate-400">
//                     <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                     <p>No payout requests yet.</p>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="space-y-4">
//                       {getPaginatedData(payouts, payoutsPage, ITEMS_PER_PAGE).map(p => (
//                         <div key={String(p.id)} className="bg-slate-800 rounded-lg p-5 border border-cyan-500/30">
//                           <div className="flex justify-between mb-3">
//                             <div>
//                               <div className="flex items-center gap-2">
//                                 <span className="text-white font-semibold">Payout #{p.payout_number}</span>
//                                 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(p.status)}`}>{p.status.replace('_', ' ')}</span>
//                               </div>
//                               <div className="text-xs text-slate-400 mt-1">Requested: {new Date(p.requested_at).toLocaleString()}</div>
//                             </div>
//                             <div className="text-right">
//                               <div className="text-xl font-bold text-white">{formatCurrency(p.net_amount)}</div>
//                               <div className="text-xs text-slate-500">Net Amount</div>
//                             </div>
//                           </div>
//                           <div className="grid grid-cols-3 gap-3 text-xs">
//                             <div className="bg-slate-900 rounded p-2">
//                               <div className="text-slate-400 mb-1">Gross Amount</div>
//                               <div className="text-white font-semibold">{formatCurrency(p.gross_amount)}</div>
//                             </div>
//                             <div className="bg-slate-900 rounded p-2">
//                               <div className="text-slate-400 mb-1">TDS (10%)</div>
//                               <div className="text-orange-400 font-semibold">- {formatCurrency(p.tds_amount)}</div>
//                             </div>
//                             <div className="bg-slate-900 rounded p-2">
//                               <div className="text-slate-400 mb-1">Net Amount</div>
//                               <div className="text-emerald-400 font-bold">{formatCurrency(p.net_amount)}</div>
//                             </div>
//                           </div>
//                           <div className="mt-3 text-xs text-slate-400">
//                             Payment Method: <span className="text-white capitalize">{p.payment_method.replace('_', ' ')}</span>
//                           </div>
//                           <div className="flex justify-between text-xs mt-3">
//                             <span className="text-slate-400">Tax Period: {p.tax_year} Q{p.tax_quarter}</span>
//                             {p.payment_reference && (
//                               <span className="text-green-400 font-mono">Ref: {p.payment_reference}</span>
//                             )}
//                           </div>
//                           {p.rejected_reason && (
//                             <div className="mt-3 text-xs text-red-400">Rejected: {p.rejected_reason}</div>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                     {payouts.length > ITEMS_PER_PAGE && (
//                       <PaginationControls
//                         currentPage={payoutsPage}
//                         totalPages={getTotalPages(payouts.length, ITEMS_PER_PAGE)}
//                         onPageChange={setPayoutsPage}
//                       />
//                     )}
//                   </>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Payout Request Modal */}
//       {showPayoutModal && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">

//           <div className="
//       bg-slate-900 rounded-2xl border-2 border-cyan-500
//       w-full max-w-md
//       max-h-[90vh]
//       shadow-2xl
//       flex flex-col
//     ">

//             {/* HEADER */}
//             <div className="p-5 sm:p-6 border-b border-cyan-500/20">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-xl sm:text-2xl font-bold text-white">
//                   Request Payout
//                 </h2>

//                 <button
//                   onClick={() => setShowPayoutModal(false)}
//                   className="text-slate-400 hover:text-white transition"
//                   aria-label="Close"
//                 >
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
//             </div>

//             {/* SCROLLABLE BODY */}
//             <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scroll">

//               {/* Amount */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-1">
//                   Amount (₹)
//                 </label>

//                 <input
//                   type="number"
//                   value={payoutForm.amount}
//                   disabled
//                   onChange={(e) =>
//                     setPayoutForm({
//                       ...payoutForm,
//                       amount: parseFloat(e.target.value),
//                     })
//                   }
//                   className="w-full px-4 py-2.5 bg-slate-800 border border-cyan-500/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
//                   min="500"
//                   placeholder="Enter amount"
//                 />

//                 <p className="text-xs text-slate-400 mt-1">
//                   Minimum: ₹500 | Available: ₹{stats?.available_balance?.toLocaleString() || 0}
//                 </p>
//               </div>

//               {/* Payment Method */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-1">
//                   Payment Method
//                 </label>

//                 <select
//                   value={payoutForm.payment_method}
//                   onChange={(e) =>
//                     setPayoutForm({
//                       ...payoutForm,
//                       payment_method: e.target.value,
//                     })
//                   }
//                   className="w-full px-4 py-2.5 bg-slate-800 border border-cyan-500/30 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
//                 >
//                   <option value="bank_transfer">
//                     Bank Transfer (NEFT / IMPS)
//                   </option>
//                   <option value="upi">UPI</option>
//                 </select>
//               </div>

//               {/* Account Holder Name */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-1">
//                   Account Holder Name
//                 </label>

//                 <input
//                   type="text"
//                   value={payoutForm.account_holder}
//                   onChange={(e) =>
//                     setPayoutForm({
//                       ...payoutForm,
//                       account_holder: e.target.value,
//                     })
//                   }
//                   className="w-full px-4 py-2.5 bg-slate-800 border border-cyan-500/30 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
//                   placeholder="Full name as per bank"
//                 />
//               </div>

//               {/* Account Number / UPI */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-1">
//                   Account Number / UPI ID
//                 </label>

//                 <input
//                   type="text"
//                   value={payoutForm.account_number}
//                   onChange={(e) =>
//                     setPayoutForm({
//                       ...payoutForm,
//                       account_number: e.target.value,
//                     })
//                   }
//                   className="w-full px-4 py-2.5 bg-slate-800 border border-cyan-500/30 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
//                   placeholder={
//                     payoutForm.payment_method === "upi"
//                       ? "yourname@upi"
//                       : "Bank account number"
//                   }
//                 />
//               </div>

//               {/* IFSC Code */}
//               {payoutForm.payment_method === "bank_transfer" && (
//                 <div>
//                   <label className="block text-sm font-medium text-slate-300 mb-1">
//                     IFSC Code
//                   </label>

//                   <input
//                     type="text"
//                     value={payoutForm.ifsc_code}
//                     onChange={(e) =>
//                       setPayoutForm({
//                         ...payoutForm,
//                         ifsc_code: e.target.value.toUpperCase(),
//                       })
//                     }
//                     maxLength={11}
//                     placeholder="BANK0001234"
//                     className="w-full px-4 py-2.5 bg-slate-800 border border-cyan-500/30 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
//                   />
//                 </div>
//               )}

//               {/* Notes */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-1">
//                   Notes (Optional)
//                 </label>

//                 <textarea
//                   rows={2}
//                   value={payoutForm.notes}
//                   onChange={(e) =>
//                     setPayoutForm({
//                       ...payoutForm,
//                       notes: e.target.value,
//                     })
//                   }
//                   className="w-full px-4 py-2.5 bg-slate-800 border border-cyan-500/30 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 resize-none"
//                   placeholder="Any additional information..."
//                 />
//               </div>

//               {/* Tax Info */}
//               <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
//                 <p className="text-sm font-semibold text-cyan-300 mb-3">
//                   💡 Tax Deduction (TDS)
//                 </p>

//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between text-white">
//                     <span className="text-slate-400">Gross Amount:</span>
//                     <span className="font-semibold">₹{payoutForm.amount.toLocaleString()}</span>
//                   </div>

//                   <div className="flex justify-between text-orange-400">
//                     <span className="text-slate-400">TDS (10%):</span>
//                     <span className="font-semibold">- ₹{(payoutForm.amount * 0.10).toFixed(2)}</span>
//                   </div>

//                   <div className="h-px bg-cyan-500/30 my-2"></div>

//                   <div className="flex justify-between text-emerald-400 text-base">
//                     <span className="font-semibold">Net Amount:</span>
//                     <span className="font-bold">₹{(payoutForm.amount * 0.90).toFixed(2)}</span>
//                   </div>
//                 </div>

//                 <p className="text-xs text-slate-400 mt-3">
//                   * TDS certificate will be provided as per Income Tax regulations
//                 </p>
//               </div>
//             </div>

//             {/* FOOTER BUTTONS */}
//             <div className="p-4 sm:p-5 border-t border-cyan-500/20 flex gap-3">
//               <button
//                 onClick={() => setShowPayoutModal(false)}
//                 className="flex-1 py-2.5 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 transition font-semibold"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={requestPayout}
//                 className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-500 hover:to-emerald-500 transition font-semibold shadow-lg"
//               >
//                 Submit Request
//               </button>
//             </div>

//           </div>
//         </div>
//       )}

//     </div>
//   );
// }




// import { useState, useEffect, useMemo } from "react";
// import {
//   Users,
//   DollarSign,
//   TrendingUp,
//   Gift,
//   Copy,
//   Check,
//   Award,
//   Download,
//   CheckCircle,
//   Calculator,
//   ChevronDown,
//   ChevronUp,
//   Calendar,
//   BarChart3,
//   Info,
// } from "lucide-react";
// import { api } from "../../lib/api";
// import { useAuth } from "../../contexts/AuthContext";

// // Commission rates by billing term and level
// const COMMISSION_RATES = {
//   monthly: { l1: 5, l2: 1, l3: 1, label: "Monthly", renewalMonths: 1 },
//   quarterly: { l1: 5, l2: 1, l3: 1, label: "Quarterly", renewalMonths: 3 },
//   half_yearly: { l1: 5, l2: 1, l3: 1, label: "Half-Yearly", renewalMonths: 6 },
//   annual: { l1: 15, l2: 3, l3: 2, label: "Yearly", renewalMonths: 12 },
//   biennial: { l1: 15, l2: 3, l3: 2, label: "2-Year", renewalMonths: 24 },
//   triennial: { l1: 15, l2: 3, l3: 2, label: "3-Year", renewalMonths: 36 },
// };

// // Default server prices for calculator (can be customized)
// const DEFAULT_SERVER_PRICE = 1000; // ₹1000 average per month

// interface CalculatorInputs {
//   monthlyServers: number;
//   quarterlyServers: number;
//   halfYearlyServers: number;
//   yearlyServers: number;
//   twoYearServers: number;
//   threeYearServers: number;
//   avgServerPrice: number;
//   l2Multiplier: number; // Average L2 referrals per L1
//   l3Multiplier: number; // Average L3 referrals per L2
// }
// import {
//   getCommissionRules,
//   getReferralStats,
//   getReferralEarnings,
//   getReferralPayouts,
//   formatCurrency,
//   getStatusColor,
// } from "../../lib/referral";
// import { ReferralLandingPage } from "../../components/referrals/ReferralLandingPage";
// // Types from referral adapters
// import type {
//   ReferralEarning as AdapterReferralEarning,
//   ReferralPayout as AdapterReferralPayout,
// } from "../../types";

// interface AffiliateSubscription {
//   id: number;
//   subscription_type: string;
//   amount_paid: number;
//   referral_code: string;
//   status: string;
//   is_active: boolean;
//   is_lifetime: boolean;
//   activated_at: string;
// }

// interface AffiliateStats {
//   total_referrals_level1: number;
//   total_referrals_level2: number;
//   total_referrals_level3: number;
//   total_referrals: number;
//   active_referrals: number;
//   total_commission_earned: number;
//   pending_commission: number;
//   approved_commission: number;
//   paid_commission: number;
//   available_balance: number;
//   total_payouts: number;
//   total_payout_amount: number;
//   subscription_status: string;
//   referral_code: string;
//   is_active: boolean;
//   can_request_payout: boolean;
// }

// interface TeamMember {
//   user_id: number;
//   email: string;
//   full_name: string;
//   level: number;
//   joined_at: string;
//   has_purchased: boolean;
//   total_purchases: number;
//   total_commission: number;
//   active_servers: number;
//   child_count: number;
// }

// interface Commission {
//   id: number;
//   level: number;
//   order_amount: number;
//   commission_rate: number;
//   commission_amount: number;
//   status: string;
//   created_at: string;
//   referred_user_email?: string;
//   order_description?: string;
// }

// // Adapter-based simplified legacy stats fallback
// interface LegacyReferralStats {
//   referral_code: string;
//   total_referrals: number;
//   l1_referrals: number;
//   l2_referrals: number;
//   l3_referrals: number;
//   total_earnings: number;
//   available_balance: number;
//   total_withdrawn: number;
// }

// // NOTE: Using adapter-provided types from ../../types (import removed for brevity) prevents ID mismatch issues

// export function ReferralsEnhanced() {
//   const { profile } = useAuth();
//   const [subscription, setSubscription] =
//     useState<AffiliateSubscription | null>(null);
//   const [stats, setStats] = useState<AffiliateStats | null>(null);
//   const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
//   const [commissions, setCommissions] = useState<Commission[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [backendOffline, setBackendOffline] = useState(false);
//   const [offlineMessage, setOfflineMessage] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<
//     "overview" | "team" | "commissions" | "earnings" | "payouts"
//   >("overview");
//   const [copied, setCopied] = useState(false);
//   const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
//   const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
//   const [commissionRules, setCommissionRules] = useState<
//     Array<{
//       id: number;
//       level: number;
//       value: number;
//       type: string;
//       product_type: string;
//       name: string;
//       description?: string;
//     }>
//   >([]);
//   const [rulesLoading, setRulesLoading] = useState(false);
//   const [autoActivated, setAutoActivated] = useState(false);
//   const [legacyStats, setLegacyStats] = useState<LegacyReferralStats | null>(
//     null
//   );
//   const [razorpayLoaded, setRazorpayLoaded] = useState(false);
//   const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
//   const [welcomeMessage, setWelcomeMessage] = useState("");
//   // Use relaxed ID typing (string | number) due to backend returning string IDs
//   type UIReferralEarning = Omit<AdapterReferralEarning, "id"> & {
//     id: string | number;
//   };
//   type UIReferralPayout = Omit<AdapterReferralPayout, "id"> & {
//     id: string | number;
//   };
//   const [earnings, setEarnings] = useState<UIReferralEarning[]>([]);
//   const [payouts, setPayouts] = useState<UIReferralPayout[]>([]);

//   useEffect(() => {
//     loadData();

//     // Check if user just activated affiliate subscription
//     const justActivated = sessionStorage.getItem("affiliate_just_activated");
//     const storedMessage = sessionStorage.getItem("affiliate_welcome_message");

//     if (justActivated === "true") {
//       setShowWelcomeBanner(true);
//       setWelcomeMessage(
//         storedMessage || "🎉 Welcome to BIDUA Hosting Affiliate Program!"
//       );

//       // Clear the flags
//       sessionStorage.removeItem("affiliate_just_activated");
//       sessionStorage.removeItem("affiliate_welcome_message");

//       // Auto-hide banner after 10 seconds
//       setTimeout(() => setShowWelcomeBanner(false), 10000);
//     }
//   }, []);

//   // Load Razorpay script once
//   useEffect(() => {
//     const existing = document.querySelector(
//       'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
//     ) as HTMLScriptElement | null;
//     if (existing) {
//       setRazorpayLoaded(true);
//       return;
//     }
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;
//     script.onload = () => setRazorpayLoaded(true);
//     script.onerror = () => setRazorpayLoaded(false);
//     document.body.appendChild(script);
//   }, []);

//   const loadData = async () => {
//     setLoading(true);
//     setBackendOffline(false);
//     setOfflineMessage(null);
//     let currentSubscription: AffiliateSubscription | null = null;
//     try {
//       // First perform explicit health pre-check to avoid false offline from a single failing endpoint
//       try {
//         await api.get("/api/v1/health");
//       } catch (healthErr) {
//         if (
//           healthErr instanceof Error &&
//           healthErr.message.startsWith("BACKEND_OFFLINE")
//         ) {
//           setBackendOffline(true);
//           setOfflineMessage(
//             "Backend health check failed. Please verify API on port 8000."
//           );
//           setLoading(false);
//           return;
//         }
//       }

//       // Load subscription status
//       const subResponse = (await api.get(
//         "/api/v1/affiliate/subscription/status"
//       )) as AffiliateSubscription;
//       setSubscription(subResponse);
//       currentSubscription = subResponse as AffiliateSubscription;
//     } catch (error: unknown) {
//       // If no subscription found, attempt auto-activation from prior server purchase
//       try {
//         if (
//           error instanceof Error &&
//           error.message.startsWith("BACKEND_OFFLINE")
//         ) {
//           setBackendOffline(true);
//           setOfflineMessage(
//             "Backend connection failed. Please ensure the API is running on port 8000."
//           );
//           setLoading(false);
//           return;
//         }
//         const activateResp = await api.post(
//           "/api/v1/affiliate/subscription/activate-from-server"
//         );
//         const isSubObj = (
//           x: unknown
//         ): x is { subscription: AffiliateSubscription } => {
//           return (
//             typeof x === "object" &&
//             x !== null &&
//             "subscription" in (x as Record<string, unknown>)
//           );
//         };
//         const activated: AffiliateSubscription = isSubObj(activateResp)
//           ? activateResp.subscription
//           : (activateResp as AffiliateSubscription);
//         if (
//           activated &&
//           (activated.is_active || activated.status === "active")
//         ) {
//           setSubscription(activated);
//           setShowSubscriptionModal(false);
//           currentSubscription = activated;
//           setAutoActivated(true);
//         } else {
//           // Fall back to subscription modal
//           console.log("No subscription found, showing modal");
//           setShowSubscriptionModal(true);
//         }
//       } catch (e: unknown) {
//         // Differentiate activation failure reasons
//         if (e instanceof Error) {
//           if (e.message.startsWith("BACKEND_OFFLINE")) {
//             setBackendOffline(true);
//             setOfflineMessage("Backend connection failed during activation.");
//             setLoading(false);
//             return;
//           }
//           // Activation endpoint responded but no server purchase met criteria
//           if (e.message.includes("No completed server purchase")) {
//             setShowSubscriptionModal(true);
//           } else {
//             setShowSubscriptionModal(true);
//           }
//         } else {
//           setShowSubscriptionModal(true);
//         }
//       }
//     }

//     try {
//       // Load stats (only if subscribed)
//       if (currentSubscription) {
//         const statsResponse = (await api.get(
//           "/api/v1/affiliate/stats"
//         )) as AffiliateStats;
//         setStats(statsResponse);

//         // Load team members
//         const teamResponse = (await api.get(
//           "/api/v1/affiliate/team/members"
//         )) as TeamMember[];
//         setTeamMembers(teamResponse);

//         // Load commissions
//         const commissionsResponse = (await api.get(
//           "/api/v1/affiliate/commissions?limit=50"
//         )) as Commission[];
//         setCommissions(commissionsResponse);

//         // Load commission rules dynamically (server product_type)
//         setRulesLoading(true);
//         try {
//           const rules = await getCommissionRules("server");
//           setCommissionRules(rules);
//         } catch (e) {
//           console.warn("Failed to load commission rules", e);
//         } finally {
//           setRulesLoading(false);
//         }

//         // Adapter-based stats fallback + earnings + payouts
//         try {
//           const mapped = await getReferralStats();
//           if (mapped) {
//             setLegacyStats({
//               referral_code: mapped.referral_code || "",
//               total_referrals: mapped.total_referrals || 0,
//               l1_referrals: mapped.l1_referrals || 0,
//               l2_referrals: mapped.l2_referrals || 0,
//               l3_referrals: mapped.l3_referrals || 0,
//               total_earnings: mapped.total_earnings || 0,
//               available_balance: mapped.available_balance || 0,
//               total_withdrawn: mapped.total_withdrawn || 0,
//             });
//           }
//         } catch (statsErr) {
//           console.warn("Referral stats adapter failed", statsErr);
//         }
//         try {
//           const earn = await getReferralEarnings();
//           setEarnings(
//             (earn as AdapterReferralEarning[]).map((e) => ({
//               ...e,
//               id: e.id as string | number,
//             }))
//           );
//         } catch (earnErr) {
//           console.warn("Referral earnings fetch failed", earnErr);
//         }
//         try {
//           const ph = await getReferralPayouts();
//           setPayouts(
//             (ph as AdapterReferralPayout[]).map((p) => ({
//               ...p,
//               id: p.id as string | number,
//             }))
//           );
//         } catch (payoutErr) {
//           console.warn("Referral payouts fetch failed", payoutErr);
//         }
//       }
//     } catch {
//       console.log("Stats/Team/Commissions loading skipped - no subscription");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubscribe = async () => {
//     try {
//       // Create payment order for ₹499 subscription
//       const paymentOrderResponse = (await api.post(
//         "/api/v1/payments/create-order",
//         {
//           payment_type: "subscription",
//         }
//       )) as any;

//       if (!paymentOrderResponse?.success) {
//         throw new Error("Failed to create payment order");
//       }

//       const { payment } = paymentOrderResponse;

//       // Ensure Razorpay loaded
//       if (!razorpayLoaded || !(window as any).Razorpay) {
//         alert("Payment system is loading. Please try again in a moment.");
//         return;
//       }

//       const options = {
//         key: (import.meta as any).env?.VITE_RAZORPAY_KEY_ID,
//         amount: payment.total_amount * 100, // paise
//         currency: payment.currency || "INR",
//         name: "BIDUA Hosting",
//         description: "Affiliate Premium Subscription (₹499)",
//         order_id: payment.razorpay_order_id,
//         handler: async (response: any) => {
//           try {
//             // Verify payment on backend
//             const verificationResponse = (await api.post(
//               "/api/v1/payments/verify-payment",
//               {
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_signature: response.razorpay_signature,
//               }
//             )) as any;

//             if (!verificationResponse?.success) {
//               throw new Error("Payment verification failed");
//             }

//             // Show success message
//             const welcomeMessage =
//               verificationResponse.affiliate?.message ||
//               "🎉 Payment successful! Welcome to BIDUA Hosting Affiliate Program!";

//             // Store success state in sessionStorage to show welcome banner
//             sessionStorage.setItem("affiliate_just_activated", "true");
//             sessionStorage.setItem("affiliate_welcome_message", welcomeMessage);

//             // Reload the page to show the affiliate dashboard
//             window.location.reload();
//           } catch (err: any) {
//             console.error("Payment verification/subscription error:", err);
//             const errorMsg = err?.message || "Payment verification failed";
//             alert(
//               `❌ ${errorMsg}\n\nPlease contact support if the payment was deducted.`
//             );
//           }
//         },
//         modal: {
//           ondismiss: () => {
//             // User cancelled payment
//             console.log("Subscription payment cancelled by user");
//           },
//         },
//         theme: { color: "#06b6d4" },
//       };

//       const razorpay = new (window as any).Razorpay(options);
//       razorpay.on("payment.failed", (resp: any) => {
//         console.error("Payment failed:", resp?.error);
//         alert(resp?.error?.description || "Payment failed");
//       });
//       razorpay.open();
//     } catch (error: any) {
//       console.error("Subscription initiation failed:", error);
//       alert(error?.message || "Failed to initiate payment");
//     }
//   };

//   const copyReferralLink = () => {
//     const code = stats?.referral_code || legacyStats?.referral_code;
//     if (code) {
//       const link = `${window.location.origin}/signup?ref=${code}`;
//       navigator.clipboard.writeText(link);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   const requestPayout = async () => {
//     if (!stats || stats.available_balance < 500) {
//       alert("Minimum payout amount is ₹500");
//       return;
//     }

//     try {
//       await api.post("/api/v1/affiliate/payouts/request", {
//         amount: stats.available_balance,
//         payment_method: "bank_transfer",
//         payment_details: JSON.stringify({ account: "Your bank details" }),
//         notes: "Payout request",
//       });
//       alert("Payout request submitted successfully!");
//       loadData();
//     } catch (error) {
//       console.error("Payout request failed:", error);
//       alert("Failed to request payout. Please try again.");
//     }
//   };

//   const filterTeamByLevel = (level: number | null) => {
//     setSelectedLevel(level);
//   };

//   const filteredTeam = selectedLevel
//     ? teamMembers.filter((m) => m.level === selectedLevel)
//     : teamMembers;

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-slate-400">Loading affiliate dashboard...</div>
//       </div>
//     );
//   }

//   if (backendOffline) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center space-y-3 max-w-md">
//           <div className="text-red-400 font-semibold text-lg">
//             Backend Unreachable
//           </div>
//           <div className="text-slate-300 text-sm">
//             {offlineMessage || "Health check + fallback host failed."}
//           </div>
//           <ul className="text-xs text-slate-400 space-y-1 text-left mx-auto list-disc list-inside">
//             <li>Confirm uvicorn running on port 8000</li>
//             <li>Check no firewall/VPN blocks localhost</li>
//             <li>
//               Verify VITE_API_URL env var (currently defaulting to localhost)
//             </li>
//           </ul>
//           <button
//             onClick={loadData}
//             className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Show Landing Page for Non-Subscribers
//   if (showSubscriptionModal && !subscription) {
//     return (
//       <ReferralLandingPage
//         onSubscribe={handleSubscribe}
//         onBuyServer={() => (window.location.href = "/dashboard/servers")}
//       />
//     );
//   }

//   return (
//     <div className="w-full h-full overflow-y-auto pb-6">
//       <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
//         {/* Welcome Banner - Show after successful activation */}
//         {showWelcomeBanner && (
//           <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 sm:p-6 border-2 border-green-400 shadow-xl animate-pulse">
//             <div className="flex items-start gap-4">
//               <Award className="h-8 w-8 sm:h-12 sm:w-12 text-white flex-shrink-0" />
//               <div className="flex-1">
//                 <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
//                   Welcome to the Affiliate Program! 🎉
//                 </h3>
//                 <p className="text-white/90 mb-3 text-sm sm:text-base">
//                   {welcomeMessage}
//                 </p>
//                 <div className="flex flex-col sm:flex-row gap-2 text-xs sm:text-sm text-white/80">
//                   <span>✅ Your referral code is ready</span>
//                   <span className="hidden sm:inline">•</span>
//                   <span>✅ Start sharing and earning today</span>
//                   <span className="hidden sm:inline">•</span>
//                   <span>✅ Track all earnings in real-time</span>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setShowWelcomeBanner(false)}
//                 className="text-white/80 hover:text-white transition flex-shrink-0"
//               >
//                 <Check className="h-6 w-6" />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div className="mb-4 sm:mb-6">
//           <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
//             Affiliate Dashboard
//           </h1>
//           <p className="text-sm sm:text-base text-slate-400">
//             Manage your affiliate program and track your earnings
//           </p>
//         </div>

//         {/* Subscription Status Banner */}
//         {subscription && (
//           <div
//             className={`rounded-xl p-4 sm:p-6 border-2 ${
//               subscription.subscription_type === "free_with_server"
//                 ? "bg-gradient-to-r from-cyan-900/50 to-teal-900/50 border-cyan-500"
//                 : "bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500"
//             }`}
//           >
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//               <div className="flex items-center gap-3 sm:gap-4">
//                 <Award className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400 flex-shrink-0" />
//                 <div>
//                   <h3 className="text-white font-bold text-sm sm:text-base">
//                     {subscription.subscription_type === "free_with_server"
//                       ? "Free Lifetime Affiliate (Server Purchase)"
//                       : "Lifetime Affiliate Member"}
//                   </h3>
//                   <p className="text-slate-300 text-xs sm:text-sm">
//                     Activated on{" "}
//                     {new Date(subscription.activated_at).toLocaleDateString()}
//                   </p>
//                   {profile?.referred_by && (
//                     <p className="text-cyan-300 text-xs mt-1">
//                       Sponsor ID: {profile.referred_by}
//                     </p>
//                   )}
//                   {autoActivated && (
//                     <p className="text-green-400 text-xs mt-1">
//                       Automatically activated from your server purchase 🎉
//                     </p>
//                   )}
//                 </div>
//               </div>
//               <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 flex-shrink-0" />
//             </div>
//           </div>
//         )}

//         {/* Referral Code Card */}
//         <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl shadow-lg p-4 sm:p-6 border-2 border-cyan-400">
//           <div className="flex items-center space-x-3 mb-4">
//             <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
//             <div>
//               <h3 className="text-base sm:text-lg font-bold text-white">
//                 Your Referral Code
//               </h3>
//               <p className="text-xs sm:text-sm text-cyan-100">
//                 Share this code to start earning
//               </p>
//             </div>
//           </div>

//           <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-4">
//             <div className="text-2xl sm:text-3xl font-bold text-white tracking-wider text-center">
//               {stats?.referral_code ||
//                 legacyStats?.referral_code ||
//                 "Loading..."}
//             </div>
//           </div>

//           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
//             <input
//               type="text"
//               readOnly
//               value={`${window.location.origin}/signup?ref=${
//                 stats?.referral_code || legacyStats?.referral_code || ""
//               }`}
//               className="flex-1 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-xs sm:text-sm truncate min-w-0"
//             />
//             <button
//               onClick={copyReferralLink}
//               className="px-3 sm:px-4 py-2 bg-white text-cyan-600 rounded-lg font-semibold hover:bg-cyan-50 transition flex items-center justify-center space-x-2 text-sm sm:text-base whitespace-nowrap"
//             >
//               {copied ? (
//                 <Check className="h-4 w-4 sm:h-5 sm:w-5" />
//               ) : (
//                 <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
//               )}
//               <span>{copied ? "Copied!" : "Copy"}</span>
//             </button>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
//           <div className="bg-slate-900 rounded-xl p-4 sm:p-6 border-2 border-cyan-500">
//             <div className="flex items-center justify-between mb-3">
//               <Users className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
//             </div>
//             <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
//               {stats?.total_referrals || legacyStats?.total_referrals || 0}
//             </div>
//             <div className="text-xs sm:text-sm text-slate-400 mb-3">
//               Total Referrals
//             </div>
//             <div className="flex justify-between text-xs pt-3 border-t border-cyan-500/30">
//               <span className="text-slate-400">
//                 L1:{" "}
//                 {stats?.total_referrals_level1 ||
//                   legacyStats?.l1_referrals ||
//                   0}
//               </span>
//               <span className="text-slate-400">
//                 L2:{" "}
//                 {stats?.total_referrals_level2 ||
//                   legacyStats?.l2_referrals ||
//                   0}
//               </span>
//               <span className="text-slate-400">
//                 L3:{" "}
//                 {stats?.total_referrals_level3 ||
//                   legacyStats?.l3_referrals ||
//                   0}
//               </span>
//             </div>
//           </div>

//           <div className="bg-slate-900 rounded-xl p-4 sm:p-6 border-2 border-green-500">
//             <div className="flex items-center justify-between mb-3">
//               <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
//             </div>
//             <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
//               ₹
//               {stats?.total_commission_earned?.toLocaleString() ||
//                 legacyStats?.total_earnings?.toLocaleString() ||
//                 0}
//             </div>
//             <div className="text-xs sm:text-sm text-slate-400">
//               Total Earned
//             </div>
//           </div>

//           <div className="bg-slate-900 rounded-xl p-4 sm:p-6 border-2 border-cyan-500">
//             <div className="flex items-center justify-between mb-3">
//               <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
//             </div>
//             <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
//               ₹
//               {stats?.available_balance?.toLocaleString() ||
//                 legacyStats?.available_balance?.toLocaleString() ||
//                 0}
//             </div>
//             <div className="text-xs sm:text-sm text-slate-400 mb-2">
//               Available Balance
//             </div>
//             {stats?.can_request_payout && (
//               <button
//                 onClick={requestPayout}
//                 className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition"
//               >
//                 Request Payout
//               </button>
//             )}
//           </div>

//           <div className="bg-slate-900 rounded-xl p-4 sm:p-6 border-2 border-blue-500">
//             <div className="flex items-center justify-between mb-3">
//               <Download className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
//             </div>
//             <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
//               ₹
//               {stats?.total_payout_amount?.toLocaleString() ||
//                 legacyStats?.total_withdrawn?.toLocaleString() ||
//                 0}
//             </div>
//             <div className="text-xs sm:text-sm text-slate-400">
//               Total Withdrawn
//             </div>
//             <div className="text-xs text-slate-500 mt-2">
//               {stats?.total_payouts || 0} payouts
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-slate-900 rounded-xl border-2 border-cyan-500 overflow-hidden">
//           <div className="border-b border-cyan-500/30 overflow-x-auto">
//             <div className="flex space-x-1 p-1 min-w-max">
//               {[
//                 { id: "overview", label: "Overview", icon: TrendingUp },
//                 { id: "team", label: "My Team", icon: Users },
//                 { id: "commissions", label: "Commissions", icon: DollarSign },
//                 { id: "earnings", label: "Earnings", icon: TrendingUp },
//                 { id: "payouts", label: "Payouts", icon: Download },
//               ].map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id as typeof activeTab)}
//                   className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${
//                     activeTab === tab.id
//                       ? "bg-cyan-600 text-white"
//                       : "text-slate-400 hover:text-white hover:bg-slate-800"
//                   }`}
//                 >
//                   <tab.icon className="h-4 w-4" />
//                   <span className="hidden sm:inline">{tab.label}</span>
//                   <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="p-4 sm:p-6">
//             {/* Overview Tab */}
//             {activeTab === "overview" && (
//               <div className="space-y-4 sm:space-y-6">
//                 <div>
//                   <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">
//                     Commission Structure (Dynamic)
//                   </h3>
//                   {rulesLoading && (
//                     <div className="text-xs text-slate-400 mb-2">
//                       Loading commission rules...
//                     </div>
//                   )}
//                   {!rulesLoading && commissionRules.length === 0 && (
//                     <div className="text-xs text-slate-500 mb-4">
//                       No active commission rules found. Default percentages may
//                       apply.
//                     </div>
//                   )}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
//                     {[1, 2, 3].map((level) => {
//                       const rulesForLevel = commissionRules.filter(
//                         (r) => r.level === level
//                       );
//                       return (
//                         <div
//                           key={level}
//                           className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-cyan-500/30"
//                         >
//                           <h4 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">
//                             Level {level}
//                           </h4>
//                           {rulesForLevel.length === 0 && (
//                             <div className="text-xs text-slate-500">
//                               No rule configured.
//                             </div>
//                           )}
//                           <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
//                             {rulesForLevel.map((rule) => (
//                               <div
//                                 key={rule.id}
//                                 className="flex justify-between"
//                               >
//                                 <span
//                                   className="text-slate-400 truncate"
//                                   title={rule.description || rule.name}
//                                 >
//                                   {rule.name}
//                                 </span>
//                                 <span className="text-green-400 font-bold">
//                                   {rule.type === "percentage"
//                                     ? `${rule.value}%`
//                                     : `₹${rule.value}`}
//                                 </span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
//                   <h4 className="font-semibold text-white mb-2">
//                     Payout Information
//                   </h4>
//                   <ul className="space-y-2 text-sm text-slate-300">
//                     <li>• Minimum payout: ₹500</li>
//                     <li>• Payouts processed within 7-10 business days</li>
//                     <li>
//                       • Commissions approved automatically for verified orders
//                     </li>
//                     <li>• Track all earnings in real-time</li>
//                   </ul>
//                 </div>
//               </div>
//             )}

//             {/* Team Tab */}
//             {activeTab === "team" && (
//               <div className="space-y-4">
//                 <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
//                   <button
//                     onClick={() => filterTeamByLevel(null)}
//                     className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
//                       selectedLevel === null
//                         ? "bg-cyan-600 text-white"
//                         : "bg-slate-800 text-slate-400 hover:text-white"
//                     }`}
//                   >
//                     All Levels ({teamMembers.length})
//                   </button>
//                   <button
//                     onClick={() => filterTeamByLevel(1)}
//                     className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
//                       selectedLevel === 1
//                         ? "bg-cyan-600 text-white"
//                         : "bg-slate-800 text-slate-400 hover:text-white"
//                     }`}
//                   >
//                     Level 1 ({stats?.total_referrals_level1 || 0})
//                   </button>
//                   <button
//                     onClick={() => filterTeamByLevel(2)}
//                     className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
//                       selectedLevel === 2
//                         ? "bg-cyan-600 text-white"
//                         : "bg-slate-800 text-slate-400 hover:text-white"
//                     }`}
//                   >
//                     Level 2 ({stats?.total_referrals_level2 || 0})
//                   </button>
//                   <button
//                     onClick={() => filterTeamByLevel(3)}
//                     className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
//                       selectedLevel === 3
//                         ? "bg-cyan-600 text-white"
//                         : "bg-slate-800 text-slate-400 hover:text-white"
//                     }`}
//                   >
//                     Level 3 ({stats?.total_referrals_level3 || 0})
//                   </button>
//                 </div>

//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="border-b border-slate-700">
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">
//                           Member
//                         </th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">
//                           Level
//                         </th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">
//                           Joined
//                         </th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">
//                           Purchases
//                         </th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">
//                           Commission
//                         </th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">
//                           Servers
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredTeam.map((member) => (
//                         <tr
//                           key={member.user_id}
//                           className="border-b border-slate-800 hover:bg-slate-800/50"
//                         >
//                           <td className="py-3 px-4">
//                             <div>
//                               <div className="text-white font-medium">
//                                 {member.full_name}
//                               </div>
//                               <div className="text-slate-400 text-sm">
//                                 {member.email}
//                               </div>
//                             </div>
//                           </td>
//                           <td className="py-3 px-4">
//                             <span
//                               className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                                 member.level === 1
//                                   ? "bg-cyan-500/20 text-cyan-400"
//                                   : member.level === 2
//                                   ? "bg-blue-500/20 text-blue-400"
//                                   : "bg-purple-500/20 text-purple-400"
//                               }`}
//                             >
//                               L{member.level}
//                             </span>
//                           </td>
//                           <td className="py-3 px-4 text-slate-300 text-sm">
//                             {new Date(member.joined_at).toLocaleDateString()}
//                           </td>
//                           <td className="py-3 px-4">
//                             <div className="text-white font-medium">
//                               ₹{member.total_purchases.toLocaleString()}
//                             </div>
//                             {member.has_purchased && (
//                               <div className="text-green-400 text-xs">
//                                 ✓ Active
//                               </div>
//                             )}
//                           </td>
//                           <td className="py-3 px-4 text-green-400 font-bold">
//                             ₹{member.total_commission.toLocaleString()}
//                           </td>
//                           <td className="py-3 px-4 text-slate-300">
//                             {member.active_servers}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {filteredTeam.length === 0 && (
//                   <div className="text-center py-12 text-slate-400">
//                     <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                     <p>
//                       No team members yet. Start referring to build your team!
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Commissions Tab */}
//             {activeTab === "commissions" && (
//               <div className="space-y-4">
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="border-b border-slate-700">
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">
//                           Date
//                         </th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">
//                           From
//                         </th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">
//                           Level
//                         </th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">
//                           Order Amount
//                         </th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">
//                           Rate
//                         </th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">
//                           Commission
//                         </th>
//                         <th className="text-left py-3 px-4 text-slate-400 font-semibold">
//                           Status
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {commissions.map((comm) => (
//                         <tr
//                           key={comm.id}
//                           className="border-b border-slate-800 hover:bg-slate-800/50"
//                         >
//                           <td className="py-3 px-4 text-slate-300 text-sm">
//                             {new Date(comm.created_at).toLocaleDateString()}
//                           </td>
//                           <td className="py-3 px-4 text-slate-300 text-sm">
//                             {comm.referred_user_email || "N/A"}
//                           </td>
//                           <td className="py-3 px-4">
//                             <span className="px-2 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400">
//                               L{comm.level}
//                             </span>
//                           </td>
//                           <td className="py-3 px-4 text-white">
//                             ₹{comm.order_amount.toLocaleString()}
//                           </td>
//                           <td className="py-3 px-4 text-slate-300">
//                             {comm.commission_rate}%
//                           </td>
//                           <td className="py-3 px-4 text-green-400 font-bold">
//                             ₹{comm.commission_amount.toLocaleString()}
//                           </td>
//                           <td className="py-3 px-4">
//                             <span
//                               className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                                 comm.status === "paid"
//                                   ? "bg-green-500/20 text-green-400"
//                                   : comm.status === "approved"
//                                   ? "bg-blue-500/20 text-blue-400"
//                                   : "bg-yellow-500/20 text-yellow-400"
//                               }`}
//                             >
//                               {comm.status}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {commissions.length === 0 && (
//                   <div className="text-center py-12 text-slate-400">
//                     <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                     <p>
//                       No commissions yet. Commissions will appear here when your
//                       referrals make purchases.
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Earnings Tab */}
//             {activeTab === "earnings" && (
//               <div className="space-y-4">
//                 {earnings.length === 0 && (
//                   <div className="text-center py-12 text-slate-400">
//                     <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                     <p>
//                       No earnings yet. When your referrals generate commissions,
//                       they will appear here.
//                     </p>
//                   </div>
//                 )}
//                 {earnings.map((e) => (
//                   <div
//                     key={String(e.id)}
//                     className="bg-slate-800 rounded-lg p-4 border border-cyan-500/30"
//                   >
//                     <div className="flex justify-between mb-2">
//                       <div>
//                         <div className="text-white font-semibold">
//                           Level {e.level} Commission
//                         </div>
//                         <div className="text-xs text-slate-400">
//                           {new Date(e.created_at).toLocaleString()}
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-green-400 font-bold text-lg">
//                           +{formatCurrency(e.commission_amount)}
//                         </div>
//                         <div className="text-xs text-slate-500">
//                           Order: {formatCurrency(e.order_amount)}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex items-center justify-between pt-2 border-t border-slate-700 text-xs">
//                       <span className="text-slate-400">
//                         Rate: {e.commission_percentage}%
//                       </span>
//                       {e.is_recurring && (
//                         <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
//                           Recurring
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Payouts Tab */}
//             {activeTab === "payouts" && (
//               <div className="space-y-6">
//                 {stats?.can_request_payout && (
//                   <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 border-2 border-green-400">
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <h3 className="text-lg font-bold text-white mb-2">
//                           Ready for Payout!
//                         </h3>
//                         <p className="text-green-100 mb-3">
//                           You have{" "}
//                           {formatCurrency(
//                             stats?.available_balance ||
//                               legacyStats?.available_balance ||
//                               0
//                           )}{" "}
//                           available for withdrawal
//                         </p>
//                         <div className="grid grid-cols-3 gap-2 text-xs text-green-100">
//                           <div>
//                             TDS (10%):{" "}
//                             {formatCurrency(
//                               (stats?.available_balance ||
//                                 legacyStats?.available_balance ||
//                                 0) * 0.1
//                             )}
//                           </div>
//                           <div>
//                             GST (18%):{" "}
//                             {formatCurrency(
//                               (stats?.available_balance ||
//                                 legacyStats?.available_balance ||
//                                 0) * 0.18
//                             )}
//                           </div>
//                           <div className="font-semibold">
//                             Net:{" "}
//                             {formatCurrency(
//                               (stats?.available_balance ||
//                                 legacyStats?.available_balance ||
//                                 0) * 0.72
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                       <button
//                         onClick={requestPayout}
//                         className="px-5 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition"
//                       >
//                         Request Payout
//                       </button>
//                     </div>
//                   </div>
//                 )}
//                 {payouts.length === 0 ? (
//                   <div className="text-center py-12 text-slate-400">
//                     <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                     <p>No payout requests yet.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {payouts.map((p) => (
//                       <div
//                         key={String(p.id)}
//                         className="bg-slate-800 rounded-lg p-5 border border-cyan-500/30"
//                       >
//                         <div className="flex justify-between mb-3">
//                           <div>
//                             <div className="flex items-center gap-2">
//                               <span className="text-white font-semibold">
//                                 Payout #{p.payout_number}
//                               </span>
//                               <span
//                                 className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
//                                   p.status
//                                 )}`}
//                               >
//                                 {p.status.replace("_", " ")}
//                               </span>
//                             </div>
//                             <div className="text-xs text-slate-400 mt-1">
//                               Requested:{" "}
//                               {new Date(p.requested_at).toLocaleString()}
//                             </div>
//                           </div>
//                           <div className="text-right">
//                             <div className="text-xl font-bold text-white">
//                               {formatCurrency(p.net_amount)}
//                             </div>
//                             <div className="text-xs text-slate-500">
//                               Net Amount
//                             </div>
//                           </div>
//                         </div>
//                         <div className="grid grid-cols-4 gap-3 text-xs">
//                           <div className="bg-slate-900 rounded p-2">
//                             <div className="text-slate-400 mb-1">Gross</div>
//                             <div className="text-white font-semibold">
//                               {formatCurrency(p.gross_amount)}
//                             </div>
//                           </div>
//                           <div className="bg-slate-900 rounded p-2">
//                             <div className="text-slate-400 mb-1">TDS</div>
//                             <div className="text-white">
//                               {formatCurrency(p.tds_amount)}
//                             </div>
//                           </div>
//                           <div className="bg-slate-900 rounded p-2">
//                             <div className="text-slate-400 mb-1">GST</div>
//                             <div className="text-white">
//                               {formatCurrency(p.service_tax_amount)}
//                             </div>
//                           </div>
//                           <div className="bg-slate-900 rounded p-2">
//                             <div className="text-slate-400 mb-1">Method</div>
//                             <div className="text-white capitalize">
//                               {p.payment_method.replace("_", " ")}
//                             </div>
//                           </div>
//                         </div>
//                         <div className="flex justify-between text-xs mt-3">
//                           <span className="text-slate-400">
//                             Tax Period: {p.tax_year} Q{p.tax_quarter}
//                           </span>
//                           {p.payment_reference && (
//                             <span className="text-green-400 font-mono">
//                               Ref: {p.payment_reference}
//                             </span>
//                           )}
//                         </div>
//                         {p.rejected_reason && (
//                           <div className="mt-3 text-xs text-red-400">
//                             Rejected: {p.rejected_reason}
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  CheckCircle, DollarSign, TrendingUp, Users, Zap, 
  ShoppingCart, CreditCard, Gift, Target, 
  Rocket, Star, Heart, Share2, Globe, Clock, ChevronDown, ChevronUp,
  BarChart3, Sparkles
} from 'lucide-react';

// Complete commission rates for all billing terms
const COMMISSION_RATES = {
  monthly: { l1: 0.05, l2: 0.01, l3: 0.01, renewalMonths: 1, label: 'Monthly' },
  quarterly: { l1: 0.05, l2: 0.01, l3: 0.01, renewalMonths: 3, label: 'Quarterly' },
  halfYearly: { l1: 0.05, l2: 0.01, l3: 0.01, renewalMonths: 6, label: 'Half-Yearly' },
  annual: { l1: 0.15, l2: 0.03, l3: 0.02, renewalMonths: 12, label: 'Yearly' },
  twoYear: { l1: 0.15, l2: 0.03, l3: 0.02, renewalMonths: 24, label: '2-Year' },
  threeYear: { l1: 0.15, l2: 0.03, l3: 0.02, renewalMonths: 36, label: '3-Year' }
};

// Calculator inputs interface - servers per month
interface CalculatorInputs {
  monthly: number;
  quarterly: number;
  halfYearly: number;
  annual: number;
  twoYear: number;
  threeYear: number;
}

// Price inputs interface - average server price per billing term
interface PriceInputs {
  monthly: number;
  quarterly: number;
  halfYearly: number;
  annual: number;
  twoYear: number;
  threeYear: number;
}

interface ReferralLandingPageProps {
  onSubscribe: () => void;
  onBuyServer: () => void;
}

export function ReferralsEnhanced({ onSubscribe, onBuyServer }: ReferralLandingPageProps) {
  const [showFAQ, setShowFAQ] = useState<number | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Helper function to format currency in Indian number system
  const formatIndian = (num: number): string => {
    const numStr = Math.round(num).toString();
    if (numStr.length <= 3) return numStr;
    
    let result = '';
    let count = 0;
    
    for (let i = numStr.length - 1; i >= 0; i--) {
      result = numStr[i] + result;
      count++;
      if (i > 0) {
        if (count === 3 || (count > 3 && (count - 3) % 2 === 0)) {
          result = ',' + result;
        }
      }
    }
    return result;
  };
  
  const formatCrore = (amount: number) => {
    if (amount >= 10000000) {
      // Show as X.XX Cr with full number below only for large displays
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) {
      return `₹${formatIndian(amount)}`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  
  // Advanced calculator inputs - servers acquired per month for each billing term
  // Adjusted for ~3 Crore in 3 years
  const [calculatorInputs, setCalculatorInputs] = useState<CalculatorInputs>({
    monthly: 10,
    quarterly: 8,
    halfYearly: 6,
    annual: 8,
    twoYear: 5,
    threeYear: 3
  });

  // Server prices for each billing term (different due to discounts)
  const [priceInputs, setPriceInputs] = useState<PriceInputs>({
    monthly: 8000,       // ₹8,000/month
    quarterly: 20000,    // ₹20,000/quarter
    halfYearly: 35000,   // ₹35,000/half-year
    annual: 80000,       // ₹80,000/year
    twoYear: 140000,     // ₹1,40,000/2-year
    threeYear: 200000    // ₹2,00,000/3-year
  });

  // 3-Year Income Projection with detailed breakdown
  const incomeProjection = useMemo(() => {
    const months = 36;
    const projectionData = [];
    let cumulativeNewIncome = 0;
    let cumulativeRenewalIncome = 0;
    
    // Track servers for renewal calculation
    const serversByType: Record<string, { month: number; price: number; count: number }[]> = {
      monthly: [],
      quarterly: [],
      halfYearly: [],
      annual: [],
      twoYear: [],
      threeYear: []
    };
    
    for (let month = 1; month <= months; month++) {
      let monthlyNewIncome = 0;
      let monthlyRenewalIncome = 0;
      
      // Calculate new server income for this month
      Object.entries(calculatorInputs).forEach(([type, count]) => {
        if (count > 0) {
          const rates = COMMISSION_RATES[type as keyof typeof COMMISSION_RATES];
          if (!rates) return;
          
          // Use the specific price for this billing term
          const totalPrice = priceInputs[type as keyof PriceInputs];
          const l1Income = totalPrice * rates.l1 * count;
          // L2 and L3 income from network growth (simplified model)
          const l2Count = Math.floor(count * 0.3);
          const l3Count = Math.floor(l2Count * 0.3);
          const l2Income = totalPrice * rates.l2 * l2Count;
          const l3Income = totalPrice * rates.l3 * l3Count;
          
          monthlyNewIncome += l1Income + l2Income + l3Income;
          
          // Track for renewals
          serversByType[type].push({ month, price: totalPrice, count });
        }
      });
      
      // Calculate renewal income from servers due this month
      Object.entries(serversByType).forEach(([type, servers]) => {
        const rates = COMMISSION_RATES[type as keyof typeof COMMISSION_RATES];
        if (!rates) return;
        
        servers.forEach(server => {
          const monthsSinceAcquisition = month - server.month;
          if (monthsSinceAcquisition > 0 && monthsSinceAcquisition % rates.renewalMonths === 0) {
            monthlyRenewalIncome += server.price * rates.l1 * server.count;
          }
        });
      });
      
      cumulativeNewIncome += monthlyNewIncome;
      cumulativeRenewalIncome += monthlyRenewalIncome;
      
      projectionData.push({
        month,
        newIncome: monthlyNewIncome,
        renewalIncome: monthlyRenewalIncome,
        totalMonthly: monthlyNewIncome + monthlyRenewalIncome,
        cumulativeNew: cumulativeNewIncome,
        cumulativeRenewal: cumulativeRenewalIncome,
        cumulativeTotal: cumulativeNewIncome + cumulativeRenewalIncome
      });
    }
    
    return projectionData;
  }, [calculatorInputs, priceInputs]);

  // Calculate verification totals (sum of all monthly totals should equal cumulative)
  const verificationTotal = useMemo(() => {
    const sumNew = incomeProjection.reduce((acc, m) => acc + m.newIncome, 0);
    const sumRenewal = incomeProjection.reduce((acc, m) => acc + m.renewalIncome, 0);
    const sumMonthly = incomeProjection.reduce((acc, m) => acc + m.totalMonthly, 0);
    return { sumNew, sumRenewal, sumMonthly };
  }, [incomeProjection]);

  // Auto-scroll effect for the table
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserScrollingRef = useRef(false);
  
  useEffect(() => {
    if (!isAutoScrolling || !tableRef.current) return;
    
    const table = tableRef.current;
    let scrollDirection = 1; // 1 = down, -1 = up
    const scrollSpeed = 0.8; // pixels per frame - smooth scroll
    let animationId: number;
    
    const animate = () => {
      if (!tableRef.current || !isAutoScrolling) return;
      
      const currentScroll = table.scrollTop;
      const maxScroll = table.scrollHeight - table.clientHeight;
      
      // Reverse direction at bounds
      if (currentScroll >= maxScroll - 1) {
        scrollDirection = -1;
      } else if (currentScroll <= 1) {
        scrollDirection = 1;
      }
      
      table.scrollTop = currentScroll + (scrollSpeed * scrollDirection);
      animationId = requestAnimationFrame(animate);
    };
    
    // Start with a small delay
    const startTimeout = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 500);
    
    return () => {
      clearTimeout(startTimeout);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isAutoScrolling]);

  // Pause auto-scroll on user interaction - with debounce
  // Only pause on direct user touch/mouse, not programmatic scroll
  const handleTableInteraction = (e: React.TouchEvent | React.MouseEvent | React.WheelEvent) => {
    // Only handle if it's a real user interaction, not from the toggle button
    if ((e.target as HTMLElement).closest('button')) return;
    
    isUserScrollingRef.current = true;
    setIsAutoScrolling(false);
    
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Resume after 10 seconds of no interaction (longer pause for manual scrolling)
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
      setIsAutoScrolling(true);
    }, 10000);
  };
  
  // Toggle auto-scroll manually
  const toggleAutoScroll = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Prevent triggering table interaction
    e.preventDefault();
    
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    
    // Use functional update to ensure we get the latest state
    setIsAutoScrolling(currentState => {
      console.log('Toggling auto-scroll from', currentState, 'to', !currentState);
      return !currentState;
    });
  };

  const faqs = [
    {
      q: "How does the 3-level commission system work?",
      a: "You earn from 3 levels: Level 1 (your direct referrals) earns you 5-15%, Level 2 (people your referrals bring) earns you 1-3%, and Level 3 (their referrals) earns you 1-2%. Short-term plans (Monthly/Quarterly/Half-Yearly) give lower rates, while Long-term plans (Yearly+) give higher rates!"
    },
    {
      q: "Can I really make my server completely free?",
      a: "Absolutely! If your server costs ₹2,000/month and you refer just 2-3 customers who purchase similar servers, your commissions will cover your entire monthly bill. Any additional referrals become pure profit!"
    },
    {
      q: "How do I get started?",
      a: "You have two options: (1) Buy any server and get FREE lifetime affiliate access, or (2) Pay a one-time ₹499 fee for lifetime access. Once activated, you'll get your unique referral code instantly."
    },
    {
      q: "When do I receive my commissions?",
      a: "Commissions are credited once the referred customer's payment is confirmed. You can request payouts once you reach the minimum balance of ₹500. Payouts are processed within 7-10 business days."
    },
    {
      q: "Is there a limit to how much I can earn?",
      a: "No limits! Your earning potential is unlimited. The more you refer, the more you earn. Plus, you continue earning on every renewal - creating true passive income."
    },
    {
      q: "Do I need to be a technical expert to promote?",
      a: "Not at all! We provide ready-made marketing materials, email templates, social media content, and full support to help you succeed regardless of your technical background."
    }
  ];

  const successStories = [
    {
      name: "Rahul M.",
      role: "Freelance Developer",
      earning: "₹45,000/month",
      story: "I referred my clients and dev community. Now my entire infrastructure is free and I make extra income!",
      referrals: 35,
      avatar: "R"
    },
    {
      name: "Priya S.",
      role: "Digital Marketer",
      earning: "₹28,000/month",
      story: "Started with my agency clients. The recurring commissions are amazing - passive income every month!",
      referrals: 22,
      avatar: "P"
    },
    {
      name: "Amit K.",
      role: "Tech Blogger",
      earning: "₹62,000/month",
      story: "Shared with my blog audience. Level 2 and 3 commissions are game-changers for exponential growth!",
      referrals: 48,
      avatar: "A"
    }
  ];

  const commissionBreakdown = [
    {
      level: "Level 1 (Direct Referrals)",
      rate: "5-15%",
      description: "People you directly refer",
      color: "from-cyan-600 to-blue-600",
      example: "5% Short-term / 15% Long-term"
    },
    {
      level: "Level 2 (Sub-Referrals)",
      rate: "1-3%",
      description: "People your referrals bring in",
      color: "from-blue-600 to-purple-600",
      example: "1% Short-term / 3% Long-term"
    },
    {
      level: "Level 3 (Sub-Sub-Referrals)",
      rate: "1-2%",
      description: "Third level of your network",
      color: "from-purple-600 to-pink-600",
      example: "1% Short-term / 2% Long-term"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full px-4 sm:px-6 py-2 mb-6">
            <Rocket className="h-5 w-5 text-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-semibold text-sm sm:text-base">Transform Your Life with Unlimited Earning Potential</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Turn Your Network Into
            <br />Passive Income Machine
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed">
            Join our <span className="text-cyan-400 font-bold">3-Level Affiliate Program</span> and earn unlimited commissions. 
            Get your servers <span className="text-green-400 font-bold">100% FREE</span> or create a 
            <span className="text-purple-400 font-bold"> life-changing passive income stream</span>!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={onBuyServer}
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl font-bold text-base sm:text-lg hover:from-cyan-500 hover:to-teal-500 transition-all shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:scale-105 w-full sm:w-auto"
            >
              <ShoppingCart className="inline h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Buy Server - Get FREE Access
              <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                Most Popular!
              </div>
            </button>
            
            <button
              onClick={onSubscribe}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-base sm:text-lg hover:from-green-500 hover:to-emerald-500 transition-all shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transform hover:scale-105 w-full sm:w-auto"
            >
              <CreditCard className="inline h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Direct Subscribe - ₹499 Lifetime
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              <span>No Monthly Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              <span>Lifetime Access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              <span>3-Level Commissions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              <span>Unlimited Earnings</span>
            </div>
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">3-Level Commission Structure</h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-3xl mx-auto">
              Earn from multiple levels of referrals. The deeper your network, the more you earn - automatically!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {commissionBreakdown.map((level, idx) => (
              <div key={idx} className={`bg-gradient-to-br ${level.color} rounded-xl p-6 border-2 border-white/20 transform hover:scale-105 transition-all`}>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl sm:text-2xl font-bold">{idx + 1}</span>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg mb-2">{level.level}</h3>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{level.rate}</div>
                </div>
                <p className="text-white/90 text-xs sm:text-sm mb-3 text-center">{level.description}</p>
                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/80 mb-1">Example:</div>
                  <div className="text-sm font-semibold">{level.example}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Commission Rates Table */}
          <div className="mt-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-center mb-6 text-cyan-400">
              <BarChart3 className="inline h-5 w-5 mr-2" />
              Complete Commission Rates by Billing Term
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Billing Term</th>
                    <th className="text-center py-3 px-4 font-semibold text-cyan-400">Level 1</th>
                    <th className="text-center py-3 px-4 font-semibold text-blue-400">Level 2</th>
                    <th className="text-center py-3 px-4 font-semibold text-purple-400">Level 3</th>
                    <th className="text-center py-3 px-4 font-semibold text-green-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-700/50 bg-orange-500/10">
                    <td colSpan={5} className="py-2 px-4 font-semibold text-orange-400 text-xs uppercase tracking-wider">
                      Short-Term Plans (Lower Rates)
                    </td>
                  </tr>
                  <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white">Monthly</td>
                    <td className="py-3 px-4 text-center text-cyan-400 font-bold">5%</td>
                    <td className="py-3 px-4 text-center text-blue-400">1%</td>
                    <td className="py-3 px-4 text-center text-purple-400">1%</td>
                    <td className="py-3 px-4 text-center text-green-400 font-bold">7%</td>
                  </tr>
                  <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white">Quarterly</td>
                    <td className="py-3 px-4 text-center text-cyan-400 font-bold">5%</td>
                    <td className="py-3 px-4 text-center text-blue-400">1%</td>
                    <td className="py-3 px-4 text-center text-purple-400">1%</td>
                    <td className="py-3 px-4 text-center text-green-400 font-bold">7%</td>
                  </tr>
                  <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white">Half-Yearly</td>
                    <td className="py-3 px-4 text-center text-cyan-400 font-bold">5%</td>
                    <td className="py-3 px-4 text-center text-blue-400">1%</td>
                    <td className="py-3 px-4 text-center text-purple-400">1%</td>
                    <td className="py-3 px-4 text-center text-green-400 font-bold">7%</td>
                  </tr>
                  <tr className="border-b border-slate-700/50 bg-green-500/10">
                    <td colSpan={5} className="py-2 px-4 font-semibold text-green-400 text-xs uppercase tracking-wider">
                      Long-Term Plans (Higher Rates - Recommended!)
                    </td>
                  </tr>
                  <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white flex items-center gap-2">
                      Yearly <Star className="h-4 w-4 text-yellow-400" />
                    </td>
                    <td className="py-3 px-4 text-center text-cyan-400 font-bold">15%</td>
                    <td className="py-3 px-4 text-center text-blue-400">3%</td>
                    <td className="py-3 px-4 text-center text-purple-400">2%</td>
                    <td className="py-3 px-4 text-center text-green-400 font-bold">20%</td>
                  </tr>
                  <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white flex items-center gap-2">
                      2-Year <Star className="h-4 w-4 text-yellow-400" />
                    </td>
                    <td className="py-3 px-4 text-center text-cyan-400 font-bold">15%</td>
                    <td className="py-3 px-4 text-center text-blue-400">3%</td>
                    <td className="py-3 px-4 text-center text-purple-400">2%</td>
                    <td className="py-3 px-4 text-center text-green-400 font-bold">20%</td>
                  </tr>
                  <tr className="hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white flex items-center gap-2">
                      3-Year <Star className="h-4 w-4 text-yellow-400" /> <Sparkles className="h-4 w-4 text-purple-400" />
                    </td>
                    <td className="py-3 px-4 text-center text-cyan-400 font-bold">15%</td>
                    <td className="py-3 px-4 text-center text-blue-400">3%</td>
                    <td className="py-3 px-4 text-center text-purple-400">2%</td>
                    <td className="py-3 px-4 text-center text-green-400 font-bold">20%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm">
              <strong className="text-yellow-400">Pro Tip:</strong> 
              <span className="text-slate-300"> Encourage referrals to choose yearly+ plans for 3x higher commissions!</span>
            </div>
          </div>
        </div>

        {/* Advanced 3-Year Income Calculator */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border-2 border-purple-500/30 mb-12 sm:mb-16">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <span className="text-purple-300 font-semibold">Advanced 3-Year Income Calculator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Project Your Earnings Over 3 Years</h2>
            <p className="text-slate-300 text-sm sm:text-base">Enter how many servers you can refer per month at each billing term</p>
          </div>

          {/* Calculator Inputs Grid - Servers per Month */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-center text-slate-300 mb-4">
              📊 Servers You Can Refer Per Month (at each billing term)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(COMMISSION_RATES).map(([key, rate]) => (
                <div key={key} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <label className="block text-xs text-slate-400 mb-2">{rate.label}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={calculatorInputs[key as keyof CalculatorInputs] === 0 ? '' : calculatorInputs[key as keyof CalculatorInputs]}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setCalculatorInputs(prev => ({
                        ...prev,
                        [key]: val === '' ? 0 : Math.min(parseInt(val), 100)
                      }));
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-center font-bold focus:border-purple-500 focus:outline-none"
                    placeholder="0"
                  />
                  <div className="text-xs text-center mt-1 text-slate-500">
                    {key === 'monthly' || key === 'quarterly' || key === 'halfYearly' ? '5%' : '15%'} L1
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Short-term Plans Price Sliders */}
          <div className="mb-6 bg-slate-900/50 rounded-xl p-5 border border-cyan-500/30">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Short-Term Plans (5% L1 Commission)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Monthly Price */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Monthly Plan Price: <span className="text-cyan-400 font-bold">₹{priceInputs.monthly.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={priceInputs.monthly}
                  onChange={(e) => setPriceInputs(prev => ({ ...prev, monthly: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>₹500</span>
                  <span>₹20,000</span>
                </div>
              </div>
              
              {/* Quarterly Price */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Quarterly Plan Price: <span className="text-cyan-400 font-bold">₹{priceInputs.quarterly.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={priceInputs.quarterly}
                  onChange={(e) => setPriceInputs(prev => ({ ...prev, quarterly: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>₹1,000</span>
                  <span>₹50,000</span>
                </div>
              </div>
              
              {/* Half-Yearly Price */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Half-Yearly Plan Price: <span className="text-cyan-400 font-bold">₹{priceInputs.halfYearly.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="2000"
                  max="80000"
                  step="1000"
                  value={priceInputs.halfYearly}
                  onChange={(e) => setPriceInputs(prev => ({ ...prev, halfYearly: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>₹2,000</span>
                  <span>₹80,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Long-term Plans Price Sliders */}
          <div className="mb-8 bg-slate-900/50 rounded-xl p-5 border border-purple-500/30">
            <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Long-Term Plans (15% L1 Commission) - Higher Discounts!
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Yearly Price */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Yearly Plan Price: <span className="text-purple-400 font-bold">₹{priceInputs.annual.toLocaleString()}</span>
                  <span className="text-xs text-green-400 ml-2">(20% off)</span>
                </label>
                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="5000"
                  value={priceInputs.annual}
                  onChange={(e) => setPriceInputs(prev => ({ ...prev, annual: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>₹10,000</span>
                  <span>₹2,00,000</span>
                </div>
              </div>
              
              {/* 2-Year Price */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  2-Year Plan Price: <span className="text-purple-400 font-bold">₹{priceInputs.twoYear.toLocaleString()}</span>
                  <span className="text-xs text-green-400 ml-2">(25% off)</span>
                </label>
                <input
                  type="range"
                  min="20000"
                  max="350000"
                  step="5000"
                  value={priceInputs.twoYear}
                  onChange={(e) => setPriceInputs(prev => ({ ...prev, twoYear: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>₹20,000</span>
                  <span>₹3,50,000</span>
                </div>
              </div>
              
              {/* 3-Year Price */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  3-Year Plan Price: <span className="text-purple-400 font-bold">₹{priceInputs.threeYear.toLocaleString()}</span>
                  <span className="text-xs text-green-400 ml-2">(35% off)</span>
                </label>
                <input
                  type="range"
                  min="30000"
                  max="500000"
                  step="5000"
                  value={priceInputs.threeYear}
                  onChange={(e) => setPriceInputs(prev => ({ ...prev, threeYear: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>₹30,000</span>
                  <span>₹5,00,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Year Projection Results - Enhanced Display */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-center text-white mb-6 flex items-center justify-center gap-2">
              💰 Your Projected Earnings
            </h3>
            
            {/* Year-wise Totals */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
              <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-cyan-500/50 text-center">
                <div className="text-xs sm:text-sm text-cyan-300 mb-1 sm:mb-2">📅 Year 1</div>
                <div className="text-base sm:text-xl md:text-2xl font-bold text-white mb-1">
                  {formatCrore(incomeProjection[11]?.cumulativeTotal || 0)}
                </div>
                <div className="hidden sm:block text-xs text-slate-400">
                  ₹{incomeProjection[11]?.cumulativeTotal.toLocaleString() || '0'}
                </div>
                <div className="text-[10px] sm:text-xs text-green-400 mt-1">
                  {formatCrore(Math.round((incomeProjection[11]?.cumulativeTotal || 0) / 12))}/mo
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-blue-500/50 text-center">
                <div className="text-xs sm:text-sm text-blue-300 mb-1 sm:mb-2">📅 Year 2</div>
                <div className="text-base sm:text-xl md:text-2xl font-bold text-white mb-1">
                  {formatCrore(incomeProjection[23]?.cumulativeTotal || 0)}
                </div>
                <div className="hidden sm:block text-xs text-slate-400">
                  ₹{incomeProjection[23]?.cumulativeTotal.toLocaleString() || '0'}
                </div>
                <div className="text-[10px] sm:text-xs text-green-400 mt-1">
                  {formatCrore(Math.round(((incomeProjection[23]?.cumulativeTotal || 0) - (incomeProjection[11]?.cumulativeTotal || 0)) / 12))}/mo
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-purple-500/50 text-center">
                <div className="text-xs sm:text-sm text-purple-300 mb-1 sm:mb-2">📅 Year 3</div>
                <div className="text-base sm:text-xl md:text-2xl font-bold text-white mb-1">
                  {formatCrore(incomeProjection[35]?.cumulativeTotal || 0)}
                </div>
                <div className="hidden sm:block text-xs text-slate-400">
                  ₹{incomeProjection[35]?.cumulativeTotal.toLocaleString() || '0'}
                </div>
                <div className="text-[10px] sm:text-xs text-green-400 mt-1">
                  {formatCrore(Math.round(((incomeProjection[35]?.cumulativeTotal || 0) - (incomeProjection[23]?.cumulativeTotal || 0)) / 12))}/mo
                </div>
              </div>
            </div>

            {/* Monthly Income Growth Highlight */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-lg sm:rounded-xl p-3 sm:p-5 border border-green-500/40">
                <div className="text-center sm:text-left">
                  <div className="text-xs sm:text-sm text-green-300 mb-1">🚀 Month 1</div>
                  <div className="text-base sm:text-xl md:text-2xl font-bold text-white">
                    {formatCrore(incomeProjection[0]?.totalMonthly || 0)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400">Starting</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg sm:rounded-xl p-3 sm:p-5 border border-purple-500/40">
                <div className="text-center sm:text-left">
                  <div className="text-xs sm:text-sm text-purple-300 mb-1">🎯 Month 36</div>
                  <div className="text-base sm:text-xl md:text-2xl font-bold text-white">
                    {formatCrore(incomeProjection[35]?.totalMonthly || 0)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-green-400">
                    {incomeProjection[0]?.totalMonthly ? 
                      `${Math.round((incomeProjection[35]?.totalMonthly || 0) / incomeProjection[0].totalMonthly * 100)}% growth` 
                      : 'Growth'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Grand Total - Prominent Display */}
            <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-xl p-4 sm:p-6 border-2 border-yellow-500/50 mb-6">
              <div className="text-center">
                <div className="text-xs sm:text-sm text-yellow-300 mb-1">🏆 3-Year Grand Total Earnings</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  {formatCrore(incomeProjection[35]?.cumulativeTotal || 0)}
                </div>
                <div className="text-sm text-slate-300 mb-2">
                  ₹{incomeProjection[35]?.cumulativeTotal.toLocaleString() || '0'}
                </div>
                <div className="flex justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
                  <span className="text-cyan-400">New: {formatCrore(incomeProjection[35]?.cumulativeNew || 0)}</span>
                  <span className="text-green-400">Renewals: {formatCrore(incomeProjection[35]?.cumulativeRenewal || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown for Last Month */}
          <div className="bg-slate-900/50 rounded-xl p-4 sm:p-6 border border-slate-700">
            <h3 className="font-semibold text-center mb-3 sm:mb-4 text-slate-300 text-sm sm:text-base">📊 Month 36 Breakdown</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center bg-cyan-900/30 rounded-lg p-2 sm:p-4 border border-cyan-500/30">
                <div className="text-[10px] sm:text-xs text-cyan-400 mb-1">New Server</div>
                <div className="text-sm sm:text-lg md:text-xl font-bold text-white">
                  {formatCrore(incomeProjection[35]?.newIncome || 0)}
                </div>
                <div className="hidden sm:block text-[10px] text-slate-500">₹{incomeProjection[35]?.newIncome.toLocaleString()}</div>
              </div>
              <div className="text-center bg-green-900/30 rounded-lg p-2 sm:p-4 border border-green-500/30">
                <div className="text-[10px] sm:text-xs text-green-400 mb-1">Renewal</div>
                <div className="text-sm sm:text-lg md:text-xl font-bold text-white">
                  {formatCrore(incomeProjection[35]?.renewalIncome || 0)}
                </div>
                <div className="hidden sm:block text-[10px] text-slate-500">₹{incomeProjection[35]?.renewalIncome.toLocaleString()}</div>
              </div>
              <div className="text-center bg-purple-900/30 rounded-lg p-2 sm:p-4 border border-purple-500/30">
                <div className="text-[10px] sm:text-xs text-purple-400 mb-1">Total</div>
                <div className="text-sm sm:text-lg md:text-xl font-bold text-white">
                  {formatCrore(incomeProjection[35]?.totalMonthly || 0)}
                </div>
                <div className="hidden sm:block text-[10px] text-slate-500">₹{incomeProjection[35]?.totalMonthly.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Complete 36-Month Income Table */}
          <div className="bg-slate-900/50 rounded-xl p-2 sm:p-6 border border-slate-700 mt-6 -mx-2 sm:mx-0">
            <h3 className="font-semibold text-center mb-4 text-lg text-white flex items-center justify-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              Complete 36-Month Income Breakdown
            </h3>
            <p className="text-center text-xs text-slate-400 mb-2">
              Auto-scrolling • Touch to pause • New server commissions + renewal income
            </p>
            
            {/* Auto-scroll indicator - clickable toggle */}
            <div className="flex justify-center mb-3">
              <button 
                type="button"
                onClick={toggleAutoScroll}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all select-none touch-manipulation ${isAutoScrolling ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50' : 'bg-slate-600/50 text-slate-300 hover:bg-slate-600/70 border border-slate-500/50'}`}
              >
                <div className={`w-2 h-2 rounded-full ${isAutoScrolling ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`}></div>
                {isAutoScrolling ? 'Auto-scroll ON (tap to pause)' : 'Auto-scroll OFF (tap to start)'}
              </button>
            </div>
            
            <div 
              ref={tableRef}
              onTouchStart={handleTableInteraction}
              onMouseDown={handleTableInteraction}
              onWheel={handleTableInteraction}
              className="max-h-80 sm:max-h-96 overflow-auto border border-slate-700 rounded-lg touch-pan-x touch-pan-y"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <table className="w-full text-xs sm:text-sm">
                <thead className="sticky top-0 bg-slate-800 z-10">
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-2 sm:py-3 px-1.5 sm:px-3 font-semibold text-slate-300 whitespace-nowrap">Month</th>
                    <th className="text-right py-2 sm:py-3 px-1.5 sm:px-3 font-semibold text-cyan-400 whitespace-nowrap">New</th>
                    <th className="text-right py-2 sm:py-3 px-1.5 sm:px-3 font-semibold text-green-400 whitespace-nowrap">Renewal</th>
                    <th className="text-right py-2 sm:py-3 px-1.5 sm:px-3 font-semibold text-white whitespace-nowrap">Monthly</th>
                    <th className="text-right py-2 sm:py-3 px-1.5 sm:px-3 font-semibold text-purple-400 whitespace-nowrap">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeProjection.map((monthData, index) => {
                    const isYearEnd = (index + 1) % 12 === 0;
                    const yearNumber = Math.floor(index / 12) + 1;
                    return (
                      <tr 
                        key={index} 
                        className={`border-b border-slate-700/50 hover:bg-slate-700/30 ${isYearEnd ? 'bg-purple-900/20' : ''}`}
                      >
                        <td className="py-2 px-2 sm:px-3 text-slate-300">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="font-medium">{monthData.month}</span>
                            {isYearEnd && (
                              <span className="text-[10px] sm:text-xs bg-purple-500/30 text-purple-300 px-1 sm:px-2 py-0.5 rounded-full">
                                Y{yearNumber}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-1.5 sm:px-3 text-right text-cyan-400 text-[11px] sm:text-sm whitespace-nowrap">
                          ₹{formatIndian(monthData.newIncome)}
                        </td>
                        <td className="py-2 px-1.5 sm:px-3 text-right text-green-400 text-[11px] sm:text-sm whitespace-nowrap">
                          ₹{formatIndian(monthData.renewalIncome)}
                        </td>
                        <td className="py-2 px-1.5 sm:px-3 text-right text-white font-semibold text-[11px] sm:text-sm whitespace-nowrap">
                          ₹{formatIndian(monthData.totalMonthly)}
                        </td>
                        <td className="py-2 px-1.5 sm:px-3 text-right text-purple-400 font-bold text-[11px] sm:text-sm whitespace-nowrap">
                          ₹{formatIndian(monthData.cumulativeTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="sticky bottom-0 bg-slate-800 border-t-2 border-purple-500">
                  <tr>
                    <td className="py-2 sm:py-3 px-1.5 sm:px-3 font-bold text-white text-xs sm:text-sm">TOTAL</td>
                    <td className="py-2 sm:py-3 px-1.5 sm:px-3 text-right text-cyan-400 font-bold text-[11px] sm:text-sm whitespace-nowrap">
                      ₹{formatIndian(verificationTotal.sumNew)}
                    </td>
                    <td className="py-2 sm:py-3 px-1.5 sm:px-3 text-right text-green-400 font-bold text-[11px] sm:text-sm whitespace-nowrap">
                      ₹{formatIndian(verificationTotal.sumRenewal)}
                    </td>
                    <td className="py-2 sm:py-3 px-1.5 sm:px-3 text-right text-white font-bold text-[11px] sm:text-sm whitespace-nowrap">
                      ₹{formatIndian(verificationTotal.sumMonthly)}
                    </td>
                    <td className="py-2 sm:py-3 px-1.5 sm:px-3 text-right text-purple-400 font-bold text-xs sm:text-base whitespace-nowrap">
                      ₹{formatIndian(incomeProjection[35]?.cumulativeTotal || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Verification Check - Cross-verify calculations */}
            <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-green-300 font-semibold">Calculation Verified</span>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400">
                  Sum: ₹{formatIndian(verificationTotal.sumMonthly)} = 
                  Total: ₹{formatIndian(incomeProjection[35]?.cumulativeTotal || 0)}
                  {verificationTotal.sumMonthly === incomeProjection[35]?.cumulativeTotal ? 
                    <span className="text-green-400 ml-2">✓ Match</span> : 
                    <span className="text-red-400 ml-2">✗ Mismatch</span>
                  }
                </div>
              </div>
            </div>
            
            {/* Summary Stats Below Table */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 mt-4">
              <div className="bg-cyan-900/30 rounded-lg p-2 sm:p-3 text-center border border-cyan-500/30">
                <div className="text-[10px] sm:text-xs text-cyan-300 mb-1">💼 New Server</div>
                <div className="text-sm sm:text-lg font-bold text-white">{formatCrore(verificationTotal.sumNew)}</div>
                <div className="hidden sm:block text-[10px] text-slate-500">₹{verificationTotal.sumNew.toLocaleString()}</div>
              </div>
              <div className="bg-green-900/30 rounded-lg p-2 sm:p-3 text-center border border-green-500/30">
                <div className="text-[10px] sm:text-xs text-green-300 mb-1">🔄 Renewals</div>
                <div className="text-sm sm:text-lg font-bold text-white">{formatCrore(verificationTotal.sumRenewal)}</div>
                <div className="hidden sm:block text-[10px] text-slate-500">₹{verificationTotal.sumRenewal.toLocaleString()}</div>
              </div>
              <div className="bg-purple-900/30 rounded-lg p-2 sm:p-3 text-center border border-purple-500/30">
                <div className="text-[10px] sm:text-xs text-purple-300 mb-1">🏆 3-Year Total</div>
                <div className="text-sm sm:text-lg font-bold text-white">{formatCrore(verificationTotal.sumMonthly)}</div>
                <div className="hidden sm:block text-[10px] text-slate-500">₹{verificationTotal.sumMonthly.toLocaleString()}</div>
              </div>
              <div className="bg-yellow-900/30 rounded-lg p-2 sm:p-3 text-center border border-yellow-500/30">
                <div className="text-[10px] sm:text-xs text-yellow-300 mb-1">📈 Avg/Mo (Y3)</div>
                <div className="text-sm sm:text-lg font-bold text-white">
                  {formatCrore(Math.round(((incomeProjection[35]?.cumulativeTotal || 0) - (incomeProjection[23]?.cumulativeTotal || 0)) / 12))}
                </div>
                <div className="hidden sm:block text-[10px] text-slate-500">₹{Math.round(((incomeProjection[35]?.cumulativeTotal || 0) - (incomeProjection[23]?.cumulativeTotal || 0)) / 12).toLocaleString()}</div>
              </div>
              <div className="bg-pink-900/30 rounded-lg p-2 sm:p-3 text-center border border-pink-500/30">
                <div className="text-[10px] sm:text-xs text-pink-300 mb-1">🎯 Month 36</div>
                <div className="text-sm sm:text-lg font-bold text-white">
                  {formatCrore(incomeProjection[35]?.totalMonthly || 0)}
                </div>
                <div className="hidden sm:block text-[10px] text-slate-500">₹{incomeProjection[35]?.totalMonthly.toLocaleString()}</div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg p-3 sm:p-4 border border-blue-500/30">
                <h4 className="text-xs sm:text-sm font-semibold text-blue-300 mb-2">💡 Why Long-Term Plans Pay More</h4>
                <ul className="text-[10px] sm:text-xs text-slate-300 space-y-1">
                  <li>• Yearly+ plans give <span className="text-green-400 font-bold">15%</span> commission vs 5% for monthly</li>
                  <li>• Higher plan prices = higher absolute earnings</li>
                  <li>• Renewals compound your income over time</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-3 sm:p-4 border border-purple-500/30">
                <h4 className="text-xs sm:text-sm font-semibold text-purple-300 mb-2">📊 Your Renewal Power</h4>
                <div className="text-xs text-slate-300">
                  <p>By Year 3, <span className="text-green-400 font-bold">
                    {incomeProjection[35]?.cumulativeRenewal && incomeProjection[35]?.cumulativeTotal ? 
                      Math.round((incomeProjection[35].cumulativeRenewal / incomeProjection[35].cumulativeTotal) * 100) : 0}%
                  </span> of your income comes from renewals!</p>
                  <p className="mt-1 text-slate-400">This is truly passive income that grows every year.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-slate-400">
            <Heart className="inline h-4 w-4 text-red-400 mr-1" />
            This projection assumes consistent monthly referrals. Actual earnings grow with network expansion!
          </div>
        </div>

        {/* Call to Action After Calculator */}
        <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-2xl p-6 sm:p-8 border-2 border-green-500/50 mb-12 sm:mb-16 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">🚀 Ready to Start Earning?</h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Join our affiliate program today and start building your passive income stream. 
            The numbers above show what's possible with consistent effort!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onBuyServer}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/25"
            >
              🖥️ Buy Server & Get FREE Access
            </button>
            <button
              onClick={onSubscribe}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-bold text-lg hover:from-purple-400 hover:to-pink-500 transition-all shadow-lg hover:shadow-purple-500/25"
            >
              ⚡ Pay ₹499 for Lifetime Access
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-4">One-time payment • No recurring fees • Start earning immediately</p>
        </div>

        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Real Success Stories</h2>
            <p className="text-slate-300 text-sm sm:text-base">See how our affiliates are transforming their income</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {successStories.map((story, idx) => (
              <div key={idx} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/30 hover:border-cyan-500/60 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold flex-shrink-0">
                    {story.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-white truncate">{story.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-400">{story.role}</p>
                  </div>
                </div>
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
                  <div className="text-xs text-green-300 mb-1">Monthly Earnings</div>
                  <div className="text-xl sm:text-2xl font-bold text-green-400">{story.earning}</div>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm italic mb-3">"{story.story}"</p>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Referrals:</span>
                  <span className="text-cyan-400 font-bold">{story.referrals} customers</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">What You Get</h2>
            <p className="text-slate-300 text-sm sm:text-base">Everything you need to succeed in our affiliate program</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Gift, title: "Lifetime Access", desc: "One-time payment, earn forever. No recurring fees ever!" },
              { icon: TrendingUp, title: "3-Level Commissions", desc: "Earn from your network and their networks too" },
              { icon: DollarSign, title: "Recurring Income", desc: "Get paid every time your referrals renew" },
              { icon: Users, title: "Track Everything", desc: "Real-time dashboard to monitor all earnings & team" },
              { icon: Zap, title: "Instant Activation", desc: "Start earning immediately after joining" },
              { icon: Target, title: "Marketing Support", desc: "Ready-made banners, templates & promotional materials" },
              { icon: Globe, title: "No Limits", desc: "Unlimited referrals, unlimited earning potential" },
              { icon: Clock, title: "Fast Payouts", desc: "Request payout anytime, processed within 7-10 days" },
              { icon: Share2, title: "Easy Sharing", desc: "Unique referral link that works everywhere" }
            ].map((benefit, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all">
                <benefit.icon className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-400 mb-4" />
                <h3 className="font-bold text-base sm:text-lg mb-2">{benefit.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border-2 border-cyan-500/30 mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Flexible Payout Options</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[
              { method: "Bank Transfer", min: "₹500", time: "7-10 days", icon: "🏦" },
              { method: "UPI", min: "₹500", time: "Instant", icon: "📱" },
              { method: "Account Credit", min: "Any amount", time: "Instant", icon: "💳" },
              { method: "PayPal", min: "$10", time: "1-3 days", icon: "💰" }
            ].map((method, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <div className="text-3xl mb-3 text-center">{method.icon}</div>
                <h3 className="font-bold text-center mb-3 text-sm sm:text-base">{method.method}</h3>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Minimum:</span>
                    <span className="text-white font-semibold">{method.min}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Processing:</span>
                    <span className="text-green-400 font-semibold">{method.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-4 text-center text-xs sm:text-sm">
            <strong className="text-cyan-300">Tax Information:</strong> TDS (10%) and GST (18%) applicable as per Indian tax regulations. 
            Net payout = Gross amount × 0.72
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-300 text-sm sm:text-base">Everything you need to know to get started</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <button
                  onClick={() => setShowFAQ(showFAQ === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-700/30 transition-all"
                >
                  <span className="font-semibold text-sm sm:text-base pr-4">{faq.q}</span>
                  {showFAQ === idx ? (
                    <ChevronUp className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {showFAQ === idx && (
                  <div className="px-6 pb-4 text-slate-300 text-xs sm:text-sm">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-center border-2 border-white/20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Ready to Transform Your Income?</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-cyan-100 max-w-3xl mx-auto">
            Join thousands of successful affiliates earning passive income. Start your journey today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <button
              onClick={onBuyServer}
              className="px-8 py-4 bg-white text-cyan-600 rounded-xl font-bold text-lg hover:bg-cyan-50 transition-all shadow-xl transform hover:scale-105 w-full sm:w-auto"
            >
              <ShoppingCart className="inline h-6 w-6 mr-2" />
              Buy Server - Get FREE Access
            </button>
            
            <button
              onClick={onSubscribe}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-lg hover:from-green-500 hover:to-emerald-500 transition-all shadow-xl transform hover:scale-105 w-full sm:w-auto"
            >
              <CreditCard className="inline h-6 w-6 mr-2" />
              Subscribe Now - ₹499
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-cyan-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Lifetime Access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>No Recurring Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Start Earning Today</span>
            </div>
          </div>
        </div>

        {/* Spacer for sticky bottom bar */}
        <div className="h-20 sm:h-0"></div>

      </div>

      {/* Sticky Bottom Total Bar - Mobile Only */}
      <div className="fixed bottom-16 left-0 right-0 sm:hidden bg-gradient-to-r from-slate-900 via-purple-900/90 to-slate-900 border-t border-purple-500/50 px-4 py-3 z-50 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-purple-300">3-Year Total</div>
            <div className="text-lg font-bold text-white">
              {formatCrore(incomeProjection[35]?.cumulativeTotal || 0)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-green-300">Month 36 Earning</div>
            <div className="text-base font-bold text-green-400">
              {formatCrore(incomeProjection[35]?.totalMonthly || 0)}/mo
            </div>
          </div>
          <button
            onClick={onSubscribe}
            className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-lg font-bold text-sm shadow-lg"
          >
            Join Now
          </button>
        </div>
      </div>
    </div>
  );
}
