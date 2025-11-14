// Placeholder file - referral functions will be implemented with API
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    requested: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    under_review: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    approved: 'bg-green-500/20 text-green-400 border border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
    paid: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  };
  return colors[status] || 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
};

// Stub functions - will be implemented with API calls
export const getReferralStats = async () => {
  return null;
};

export const getReferralEarnings = async () => {
  return [];
};

export const getReferralPayouts = async () => {
  return [];
};

export const requestPayout = async () => {
  return { success: false, error: 'Not implemented yet' };
};

export const adminApprovePayout = async () => {
  return { success: false, error: 'Not implemented yet' };
};

export const adminRejectPayout = async () => {
  return { success: false, error: 'Not implemented yet' };
};
