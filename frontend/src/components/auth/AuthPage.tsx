/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthForm } from './AuthForm';
import { Library } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthPageProps {
  onLogin: (data: any) => void;
  onRegister: (data: any) => void;
  isLoading?: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLogin,
  onRegister,
  isLoading = false,
}) => {
  const [type, setType] = useState<'login' | 'register'>('login');

  return (
    /* flex-col giúp form luôn chiếm trọn chiều rộng khi banner ẩn */
    <div className="flex flex-col xl:flex-row bg-white overflow-hidden">
      
      {/* 1. PHẦN BANNER: Chỉ hiện khi màn hình cực lớn (xl). 
          Trong Modal thông thường, nó sẽ ẩn đi để nhường chỗ cho Form */}
      <div className="hidden xl:flex flex-col justify-center gap-6 w-[400px] bg-sky-50 p-10 border-r border-sky-100">
        <div className="flex items-center gap-3 text-sky-600 font-bold text-2xl">
          <Library className="w-8 h-8" />
          <span>LMS</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">
            Your Gateway to <span className="text-sky-500">Knowledge</span>
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Access thousands of resources with our modern library system.
          </p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xl font-bold text-sky-500">10k+</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Books</p>
          </div>
          <div>
            <p className="text-xl font-bold text-sky-500">5k+</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Readers</p>
          </div>
        </div>
      </div>

      {/* 2. PHẦN FORM: Giờ đây sẽ chiếm 100% Modal, chữ sẽ cực kỳ rõ ràng */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[360px] flex flex-col gap-8" // Giới hạn chiều rộng form để đẹp hơn
        >
          <div className="flex flex-col gap-3 text-center">
            {/* Logo hiện ra khi Banner ẩn */}
            <div className="xl:hidden flex justify-center mb-2">
                <div className="bg-sky-50 p-3 rounded-2xl">
                    <Library className="w-10 h-10 text-sky-600" />
                </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {type === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 text-sm">
              {type === 'login' 
                ? 'Enter your credentials to access your account' 
                : 'Join our library community today'}
            </p>
          </div>

          <AuthForm
            type={type}
            onSubmit={type === 'login' ? onLogin : onRegister}
            isLoading={isLoading}
          />

          <div className="text-center border-t border-slate-100 pt-6">
            <button
              onClick={() => setType(type === 'login' ? 'register' : 'login')}
              className="text-sm font-bold text-sky-600 hover:text-sky-700 transition-all hover:underline"
            >
              {type === 'login' 
                ? "Don't have an account? Sign Up" 
                : 'Already have an account? Sign In'}
            </button>
          </div>

          {/* Demo Access: Làm gọn gàng hơn ở dưới cùng */}
          {type === 'login' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Quick Demo Access</p>
               <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Admin:</span>
                    <span className="font-mono text-sky-600 font-bold">admin@library.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reader:</span>
                    <span className="font-mono text-sky-600 font-bold">student@university.edu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pass:</span>
                    <span className="font-mono text-sky-600 font-bold">123</span>
                  </div>
               </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};