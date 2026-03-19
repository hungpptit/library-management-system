/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

export const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
            className="w-3 h-3 bg-sky-500 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};
