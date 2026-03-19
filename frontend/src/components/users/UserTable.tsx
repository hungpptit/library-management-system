/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface UserTableProps {
  users: UserProfile[];
  onEdit?: (user: UserProfile) => void;
  onDelete?: (user: UserProfile) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white card-shadow">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student ID</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-900">{user.displayName}</td>
              <td className="px-6 py-4 text-slate-600">{user.email}</td>
              <td className="px-6 py-4 text-slate-600">{user.studentId}</td>
              <td className="px-6 py-4">
                <Badge variant={user.role === 'admin' ? 'warning' : 'primary'}>
                  {user.role}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit?.(user)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => onDelete?.(user)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

