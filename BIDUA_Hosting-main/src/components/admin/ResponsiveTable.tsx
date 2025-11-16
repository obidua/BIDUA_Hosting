import { ReactNode } from 'react';

interface ResponsiveTableProps {
  children: ReactNode;
}

export function ResponsiveTable({ children }: ResponsiveTableProps) {
  return (
    <div className="rounded-lg sm:rounded-2xl border border-slate-200 dark:border-slate-900 overflow-hidden shadow-sm dark:shadow-[0_15px_45px_rgba(2,6,23,0.7)] bg-white dark:bg-slate-950/60">
      {/* Horizontal scrollable wrapper for mobile, normal for desktop */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-900 text-slate-900 dark:text-slate-100">
          {children}
        </table>
      </div>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-900">
      {children}
    </thead>
  );
}

interface TableHeadCellProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
}

export function TableHeadCell({ children, align = 'left' }: TableHeadCellProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <th className={`px-4 sm:px-6 py-3 ${alignClass} text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 whitespace-nowrap`}>
      {children}
    </th>
  );
}

interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return (
    <tbody className="divide-y divide-slate-200 dark:divide-slate-900">
      {children}
    </tbody>
  );
}

interface TableRowProps {
  children: ReactNode;
  hover?: boolean;
}

export function TableRow({ children, hover = true }: TableRowProps) {
  return (
    <tr className={hover ? 'hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors' : ''}>
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
}

export function TableCell({ children, align = 'left' }: TableCellProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <td className={`px-4 sm:px-6 py-4 ${alignClass} whitespace-nowrap text-sm`}>
      {children}
    </td>
  );
}
