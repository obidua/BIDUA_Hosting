import { ReactNode } from 'react';

interface MetaItem {
  label: string;
  value: string;
  helper?: string;
}

interface AdminPageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
  meta?: MetaItem[];
}

export function AdminPageHeader({ title, description, actions, meta }: AdminPageHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-950/70 backdrop-blur rounded-lg sm:rounded-2xl border border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-6 shadow-sm dark:shadow-[0_20px_55px_rgba(2,6,23,0.65)] flex flex-wrap items-start justify-between gap-4">
      <div className="w-full">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-2">Admin Console</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white drop-shadow-sm">{title}</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed text-sm sm:text-base">{description}</p>

        {meta && meta.length > 0 && (
          <div className="flex flex-wrap gap-3 sm:gap-6 mt-6">
            {meta.map((item) => (
              <div
                key={item.label}
                className="px-3 sm:px-4 py-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 min-w-[140px]"
              >
                <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{item.value}</p>
                {item.helper && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.helper}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">{actions}</div>
      )}
    </div>
  );
}
