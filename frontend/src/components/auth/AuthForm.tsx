/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mail, Lock, User, Hash } from 'lucide-react';

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
    </form>
  );
};

