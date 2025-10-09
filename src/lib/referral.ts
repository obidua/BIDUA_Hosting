import { supabase } from './supabase';
import { ReferralStats, ReferralEarning, ReferralPayout } from '../types';

export async function applyReferralCode(userId: string, referralCode: string) {
  const { data, error } = await supabase.rpc('apply_referral_code_to_user', {
    user_id_param: userId,
    referral_code_param: referralCode
  });

  if (error) throw error;
  return data;
}

export async function getReferralStats(): Promise<ReferralStats> {
  const { data, error } = await supabase.rpc('get_my_referral_stats');

  if (error) throw error;
  return data as ReferralStats;
}

export async function getMyEarnings(limit = 50, offset = 0) {
  const { data, error } = await supabase.rpc('get_my_earnings', {
    limit_param: limit,
    offset_param: offset
  });

  if (error) throw error;

  return {
    total: data.total || 0,
    earnings: (data.earnings || []) as ReferralEarning[]
  };
}

export async function requestPayout(
  amount: number,
  paymentMethod: string = 'bank_transfer',
  bankDetails: Record<string, any> = {}
) {
  const { data, error } = await supabase.rpc('request_referral_payout', {
    amount_param: amount,
    payment_method_param: paymentMethod,
    bank_details_param: bankDetails
  });

  if (error) throw error;
  return data;
}

export async function getMyPayouts(): Promise<ReferralPayout[]> {
  const { data, error } = await supabase.rpc('get_my_payouts');

  if (error) throw error;
  return (data || []) as ReferralPayout[];
}

export async function adminApprovePayout(payoutId: string, paymentReference: string = '') {
  const { data, error } = await supabase.rpc('admin_approve_payout', {
    payout_id_param: payoutId,
    payment_reference_param: paymentReference
  });

  if (error) throw error;
  return data;
}

export async function adminRejectPayout(payoutId: string, reason: string) {
  const { data, error } = await supabase.rpc('admin_reject_payout', {
    payout_id_param: payoutId,
    reason_param: reason
  });

  if (error) throw error;
  return data;
}

export async function getReferralLeaderboard(limit = 10) {
  const { data, error } = await supabase.rpc('get_referral_leaderboard', {
    limit_param: limit
  });

  if (error) throw error;
  return data || [];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function calculateTaxes(grossAmount: number) {
  const tdsRate = 10;
  const serviceTaxRate = 18;

  const tdsAmount = Math.round((grossAmount * tdsRate) / 100);
  const serviceTaxAmount = Math.round((grossAmount * serviceTaxRate) / 100);
  const netAmount = grossAmount - tdsAmount - serviceTaxAmount;

  return {
    grossAmount,
    tdsAmount,
    serviceTaxAmount,
    netAmount
  };
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    paid: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
    reversed: 'bg-gray-100 text-gray-700',
    requested: 'bg-yellow-100 text-yellow-700',
    under_review: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700'
  };

  return colors[status] || 'bg-gray-100 text-gray-700';
}
