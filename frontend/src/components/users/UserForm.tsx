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
    phone: (initialData as UserProfile).phone || '',
    address: (initialData as UserProfile).address || '',
    role: (initialData as UserProfile).role || 'reader',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
        <Input
          label="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Enter phone number"
        />
        <Input
          label="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter address"
        />
        {isAdmin && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all"
            >
              <option value="reader">Reader</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 text-slate-500">
        <p className="text-sm leading-6">
          Vui lòng điền đầy đủ thông tin.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:justify-end">
        <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
          {(initialData as UserProfile).uid ? 'Update Reader' : 'Add Reader'}
        </Button>
      </div>
    </form>
  );
};

