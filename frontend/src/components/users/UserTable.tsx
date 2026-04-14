/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';

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
  const [deleteConfirm, setDeleteConfirm] = useState<UserProfile | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (user: UserProfile) => {
    setDeleteConfirm(user);
    setErrorStatus(null);
  };

  const closeModal = () => {
    setDeleteConfirm(null);
    setErrorStatus(null);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      setIsDeleting(true);
      setErrorStatus(null);
      try {
        await onDelete?.(deleteConfirm);
        closeModal();
      } catch (error: any) {
        // Handle backend error messages
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete user';
        setErrorStatus(errorMsg);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
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
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-500 hover:bg-red-50" 
                    onClick={() => handleDeleteClick(user)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <Modal
          isOpen={!!deleteConfirm}
          onClose={closeModal}
          title="Delete Reader"
          maxWidth="md"
        >
          <div className="flex flex-col gap-6 items-center text-center py-2">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 animate-in fade-in zoom-in duration-300">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-slate-900 leading-tight">Confirm Deletion</h3>
              <p className="text-slate-500 max-w-[320px]">
                Are you sure you want to delete <span className="font-semibold text-slate-700">{deleteConfirm.displayName}</span>? 
                This action will permanently remove their library access.
              </p>
            </div>

            {errorStatus && (
              <div className="w-full p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3 animate-in slide-in-from-top-2 duration-200 mb-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <span className="font-bold">!</span>
                </div>
                <p className="text-left font-medium leading-relaxed">
                  {errorStatus.includes('500') || errorStatus.includes('Network Error') 
                    ? 'Server error occurred. Please try again later.' 
                    : errorStatus}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 w-full pt-4 px-2">
              <Button 
                variant="outline" 
                onClick={closeModal}
                className="flex-1 py-2.5"
                disabled={isDeleting}
              >
                Go Back
              </Button>
              <Button 
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 flex items-center justify-center gap-2" 
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Reader</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

