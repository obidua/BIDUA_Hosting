interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'payment' | 'ticket' | 'user' | 'generic';
}

export function StatusBadge({ status, type = 'generic' }: StatusBadgeProps) {
  const getStatusColor = () => {
    const status_lower = status.toLowerCase();
    
    // Order statuses
    if (type === 'order') {
      switch (status_lower) {
        case 'pending':
          return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30';
        case 'active':
        case 'processing':
          return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-500/30';
        case 'completed':
        case 'success':
          return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-500/30';
        case 'cancelled':
        case 'failed':
          return 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-500/30';
        case 'expired':
          return 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500/30';
        default:
          return 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500/30';
      }
    }

    // Payment statuses
    if (type === 'payment') {
      switch (status_lower) {
        case 'pending':
          return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30';
        case 'paid':
        case 'success':
          return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-500/30';
        case 'failed':
          return 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-500/30';
        case 'refunded':
          return 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-500/30';
        default:
          return 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500/30';
      }
    }

    // Ticket statuses
    if (type === 'ticket') {
      switch (status_lower) {
        case 'open':
        case 'new':
          return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-500/30';
        case 'in-progress':
        case 'pending':
          return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30';
        case 'resolved':
        case 'closed':
          return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-500/30';
        case 'on-hold':
          return 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-500/30';
        default:
          return 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500/30';
      }
    }

    // User statuses
    if (type === 'user') {
      switch (status_lower) {
        case 'active':
          return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-500/30';
        case 'inactive':
        case 'suspended':
          return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30';
        case 'banned':
          return 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-500/30';
        default:
          return 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500/30';
      }
    }

    // Generic fallback
    return 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500/30';
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  );
}
