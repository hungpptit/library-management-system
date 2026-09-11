/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../../types';
import { UserTable } from '../users/UserTable';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';
import { UserPlus } from 'lucide-react';
import { Pagination } from '../ui/Pagination';

interface AdminReadersProps {
  users: UserProfile[];
  onAddUser: () => void;
  onEditUser: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
  currentUserRole?: string;
}

export const AdminReaders: React.FC<AdminReadersProps> = ({
  users,
  onAddUser,
  onEditUser,
  onDeleteUser,
  currentUserRole = 'admin',
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(users.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return users.slice(startIndex, startIndex + itemsPerPage);
  }, [users, currentPage, itemsPerPage]);

  // Basic role-based access check
  if (currentUserRole !== 'admin') {
    return (
      <div className="text-center p-8">
        <p className="text-slate-600 font-medium">Access denied. Only administrators can manage readers.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Reader Management"
        subtitle="Manage library members and their access"
        action={
          <Button onClick={onAddUser} className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            <span>Add New Reader</span>
          </Button>
        }
      />
      <UserTable users={paginatedUsers} onEdit={onEditUser} onDelete={onDeleteUser} />

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-500">
            Hiển thị <span className="font-semibold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-slate-800">{Math.min(currentPage * itemsPerPage, users.length)}</span> trên tổng số <span className="font-semibold text-slate-800">{users.length}</span> độc giả
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

