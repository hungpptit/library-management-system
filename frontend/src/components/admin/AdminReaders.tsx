/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../../types';
import { UserTable } from '../users/UserTable';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';
import { UserPlus } from 'lucide-react';

interface AdminReadersProps {
  users: UserProfile[];
  onAddUser: () => void;
  onEditUser: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
}

export const AdminReaders: React.FC<AdminReadersProps> = ({
  users,
  onAddUser,
  onEditUser,
  onDeleteUser,
}) => {
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
      <UserTable users={users} onEdit={onEditUser} onDelete={onDeleteUser} />
    </div>
  );
};

