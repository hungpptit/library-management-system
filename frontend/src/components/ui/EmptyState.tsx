/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <SearchX className="w-12 h-12" />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="p-6 bg-slate-100 rounded-full text-slate-400">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-slate-500 max-w-xs">{description}</p>
      </div>
    </div>
  );
};
