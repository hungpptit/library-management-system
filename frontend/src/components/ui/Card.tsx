/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4 } : {}}
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-slate-100 p-6 
        ${hoverable ? 'card-shadow-hover cursor-pointer' : 'card-shadow'}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
