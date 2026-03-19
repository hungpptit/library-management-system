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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    studentId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {type === 'register' && (
        <>
          <Input
            label="Full Name"
            icon={<User className="w-4 h-4" />}
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            required
          />
          <Input
            label="Student ID"
            icon={<Hash className="w-4 h-4" />}
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            required
          />
        </>
      )}
      <Input
        label="Email Address"
        type="email"
        icon={<Mail className="w-4 h-4" />}
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <Input
        label="Password"
        type="password"
        icon={<Lock className="w-4 h-4" />}
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />
      <Button type="submit" isLoading={isLoading} className="w-full">
        {type === 'login' ? 'Sign In' : 'Create Account'}
      </Button>
    </form>
  );
};

