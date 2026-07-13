import React from 'react';

export function PlaceholderView({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-slate-300 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 text-center max-w-md">{description}</p>
    </div>
  );
}
