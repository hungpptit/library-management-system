/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navigation } from './Navigation';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: 'admin' | 'reader';
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onLoginClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  userRole,
  activeTab,
  onTabChange,
  onLogout,
  onLoginClick,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 md:pt-20">
      <Navigation
        userRole={userRole}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogout={onLogout}
        onLoginClick={onLoginClick}
      />
      <main className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
