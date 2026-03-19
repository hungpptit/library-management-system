/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchHeroProps {
  onSearch: (query: string) => void;
}

export const SearchHero: React.FC<SearchHeroProps> = ({ onSearch }) => {
  return (
    <div className="relative py-12 md:py-20 text-center flex flex-col items-center gap-8 overflow-hidden">
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-10">
        <div className="w-[500px] h-[500px] bg-sky-400 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 max-w-2xl"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight">
          Find your next <span className="text-sky-500">book</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl">
          Search through thousands of titles and discover your next favorite read.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-xl relative group"
      >
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
          <Search className="w-6 h-6" />
        </div>
        <input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full h-16 pl-16 pr-8 rounded-2xl bg-white border border-slate-100 card-shadow focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-50 transition-all text-lg"
        />
      </motion.div>
    </div>
  );
};
