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
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className="hidden md:flex flex-col justify-center gap-8 w-1/2 bg-sky-50 p-20">
        <div className="flex items-center gap-4 text-sky-600 font-bold text-4xl">
          <Library className="w-16 h-16" />
          <span>LMS</span>
        </div>
        <div className="flex flex-col gap-4 max-w-lg">
          <h1 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            Your Gateway to a <span className="text-sky-500">World of Knowledge</span>
          </h1>
          <p className="text-slate-500 text-xl leading-relaxed">
            Join our modern library community and access thousands of digital and physical resources with ease.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-3xl font-bold text-sky-500">10k+</span>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Books Available</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-3xl font-bold text-sky-500">5k+</span>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Readers</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md flex flex-col gap-8"
        >
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900">
              {type === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500">
              {type === 'login' 
                ? 'Enter your credentials to access your library account.' 
                : 'Fill in the details below to join our library community.'}
            </p>
          </div>

          <AuthForm
            type={type}
            onSubmit={type === 'login' ? onLogin : onRegister}
            isLoading={isLoading}
          />

          <div className="text-center">
            <button
              onClick={() => setType(type === 'login' ? 'register' : 'login')}
              className="text-sm font-medium text-sky-500 hover:text-sky-600 transition-colors"
            >
              {type === 'login' 
                ? "Don't have an account? Create one" 
                : 'Already have an account? Sign in'}
            </button>
          </div>

          {type === 'login' && (
            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Demo Credentials</p>
                <button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="text-[10px] font-bold text-sky-500 hover:text-sky-600 uppercase"
                >
                  Reset Data
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-500">Admin Account:</span>
                  <code className="text-xs bg-white p-1.5 rounded border border-slate-200 text-sky-600">admin@library.com</code>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-500">Reader Account:</span>
                  <code className="text-xs bg-white p-1.5 rounded border border-slate-200 text-sky-600">student@university.edu</code>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-500">Password:</span>
                  <code className="text-xs bg-white p-1.5 rounded border border-slate-200 text-sky-600">123</code>
                </div>
                <p className="text-[10px] text-slate-400 italic mt-1">* Use the credentials above to login</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
