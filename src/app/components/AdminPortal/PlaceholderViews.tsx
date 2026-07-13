import React from 'react';
import { Construction } from 'lucide-react';

export const ComingSoonView: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
      <Construction className="w-8 h-8 text-slate-400" />
    </div>
    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{title}</h2>
    <p className="text-slate-500 max-w-md mx-auto">{description}</p>
    <div className="mt-8 px-6 py-4 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 rounded-lg text-sm border border-amber-200 dark:border-amber-900/50">
      This feature is part of the new Super Admin Architecture but is not yet fully implemented in the backend.
    </div>
  </div>
);
