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
    <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200 px-6 py-5 shadow-sm flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600 mb-1">Admin Console</p>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-600 mt-2 max-w-2xl">{description}</p>

        {meta && meta.length > 0 && (
          <div className="flex flex-wrap gap-6 mt-4">
            {meta.map((item) => (
              <div key={item.label}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{item.label}</p>
                <p className="text-lg font-semibold text-slate-900">{item.value}</p>
                {item.helper && <p className="text-sm text-slate-500">{item.helper}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
