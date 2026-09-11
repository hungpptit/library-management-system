/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mail, Lock, User, Hash, GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  type,
  onSubmit,
  isLoading = false,
}) => {
  type FormValues = {
    email: string;
    password: string;
    displayName: string;
    studentId: string;
    phone: string;
    address: string;
  };

  type FormErrors = Partial<Record<keyof FormValues, string>>;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    studentId: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = (field: keyof FormValues, value: string, formType: 'login' | 'register'): string | undefined => {
    const normalized = value.trim();

    if (field === 'email') {
      if (!normalized) return 'Please enter your email address.';
      if (!/^\S+@\S+\.\S+$/.test(normalized)) return 'Please enter a valid email address.';
      return undefined;
    }

    if (field === 'password') {
      if (!normalized) return 'Please enter your password.';
      if (normalized.length < 3) return 'Password must be at least 3 characters.';
      return undefined;
    }

    if (formType === 'register' && field === 'displayName') {
      if (!normalized) return 'Please enter your full name.';
      return undefined;
    }

    if (formType === 'register' && field === 'studentId') {
      if (!normalized) return 'Please enter your student ID.';
      if (!/^N22DCCN\d{3}$/.test(normalized.toUpperCase())) {
        return 'Student ID must match format N22DCCNXXX.';
      }
      return undefined;
    }

    if (formType === 'register' && field === 'phone') {
      if (!normalized) return 'Please enter your phone number.';
      if (!/^\d{9,11}$/.test(normalized)) return 'Phone must be 9-11 digits.';
      return undefined;
    }

    if (formType === 'register' && field === 'address') {
      if (!normalized) return 'Please enter your address.';
      return undefined;
    }

    return undefined;
  };

  const validate = (values: FormValues): FormErrors => {
    const nextErrors: FormErrors = {};
    (['email', 'password', 'displayName', 'studentId', 'phone', 'address'] as Array<keyof FormValues>).forEach((field) => {
      const error = validateField(field, values[field], type);
      if (error) {
        nextErrors[field] = error;
      }
    });
    return nextErrors;
  };

  const updateField = (field: keyof FormValues, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      setErrors((current) => ({
        ...current,
        [field]: validateField(field, value, type),
      }));
      return next;
    });
  };

  const handleDemoLogin = (role: 'admin' | 'student', e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const demoData = role === 'admin'
      ? { email: 'admin@library.com', password: '123' }
      : { email: 'phamtuanhung24@gmail.com', password: '123' };

    setFormData((prev) => ({
      ...prev,
      ...demoData,
    }));
    setErrors({});
    onSubmit(demoData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      {type === 'register' && (
        <>
          <Input
            label="Full Name"
            icon={<User className="w-4 h-4" />}
            value={formData.displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            error={errors.displayName}
            required
          />
          <Input
            label="Student ID"
            icon={<Hash className="w-4 h-4" />}
            value={formData.studentId}
            onChange={(e) => updateField('studentId', e.target.value)}
            error={errors.studentId}
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            error={errors.phone}
            required
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            error={errors.address}
            required
          />
        </>
      )}
      <Input
        label="Email Address"
        type="email"
        icon={<Mail className="w-4 h-4" />}
        value={formData.email}
        onChange={(e) => updateField('email', e.target.value)}
        error={errors.email}
        required
      />
      <Input
        label="Password"
        type="password"
        icon={<Lock className="w-4 h-4" />}
        value={formData.password}
        onChange={(e) => updateField('password', e.target.value)}
        error={errors.password}
        required
      />
      <Button type="submit" isLoading={isLoading} className="w-full">
        {type === 'login' ? 'Sign In' : 'Create Account'}
      </Button>

      {type === 'login' && (
        <div className="flex flex-col gap-2.5 pt-1">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tài khoản Demo Nhà Tuyển Dụng
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {/* Demo Admin */}
            <button
              type="button"
              disabled={isLoading}
              onClick={(e) => handleDemoLogin('admin', e)}
              className="group relative w-full overflow-hidden rounded-xl border-2 border-sky-400 bg-gradient-to-r from-sky-50 via-sky-100/40 to-indigo-50 p-2.5 text-left shadow-sm transition-all hover:border-sky-500 hover:shadow-md hover:shadow-sky-100 active:scale-[0.99] disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">
                        Demo Admin
                      </span>
                      <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-extrabold text-sky-700 uppercase">
                        Quản trị viên
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      admin@library.com
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-sky-600 group-hover:text-sky-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
                  Đăng nhập <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>

            {/* Demo Sinh viên */}
            <button
              type="button"
              disabled={isLoading}
              onClick={(e) => handleDemoLogin('student', e)}
              className="group relative w-full overflow-hidden rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 p-2.5 text-left shadow-sm transition-all hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-100 active:scale-[0.99] disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">
                        Demo Student
                      </span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-700 uppercase">
                        Sinh viên
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      phamtuanhung24@gmail.com
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
                  Đăng nhập <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

