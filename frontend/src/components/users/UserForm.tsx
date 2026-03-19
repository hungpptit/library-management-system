/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface UserFormProps {
  initialData?: Partial<UserProfile>;
  onSubmit: (data: Partial<UserProfile>) => Promise<void>;
  isLoading?: boolean;
  isAdmin?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  isAdmin = false,
}) => {
  const [formData, setFormData] = useState({
    displayName: (initialData as UserProfile).displayName || '',
    studentId: (initialData as UserProfile).studentId || '',
    email: (initialData as UserProfile).email || '',
    role: (initialData as UserProfile).role || 'reader',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Input
        label="Full Name"
        value={formData.displayName}
        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
        placeholder="Enter reader's full name"
        required
      />
      <Input
        label="Student ID"
        value={formData.studentId}
        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
        placeholder="Enter student ID"
        required
      />
      <Input
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Enter email address"
        required
      />
      
      {isAdmin && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all bg-white"
          >
            <option value="reader">Reader</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-4">
        <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
          {(initialData as UserProfile).uid ? 'Update Reader' : 'Add Reader'}
        </Button>
      </div>
    </form>
  );
};

