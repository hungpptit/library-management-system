/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GENRES } from '../../constants';
import { Badge } from '../ui/Badge';

interface FilterSidebarProps {
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedGenre,
  onGenreChange,
  selectedStatus,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col gap-8 w-full md:w-64 shrink-0">
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Genre</h3>
        <div className="flex flex-wrap md:flex-col gap-2">
          <button
            onClick={() => onGenreChange('All')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all text-left ${
              selectedGenre === 'All' ? 'bg-sky-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Genres
          </button>
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => onGenreChange(genre)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                selectedGenre === genre ? 'bg-sky-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Status</h3>
        <div className="flex flex-wrap md:flex-col gap-2">
          {['All', 'Available', 'Unavailable'].map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                selectedStatus === status ? 'bg-sky-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

