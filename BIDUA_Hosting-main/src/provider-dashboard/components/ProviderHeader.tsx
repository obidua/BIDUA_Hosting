import React from 'react';

interface ProviderHeaderProps {
  title: string;
  description?: string;
}

export function ProviderHeader({ title, description }: ProviderHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{title}</h1>
      {description && <p className="text-slate-400">{description}</p>}
    </div>
  );
}
