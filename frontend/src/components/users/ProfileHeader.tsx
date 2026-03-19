/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../../types';
import { Card } from '../ui/Card';
import { User, Mail, Hash, Shield } from 'lucide-react';

interface ProfileHeaderProps {
  user: UserProfile;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <Card className="flex flex-col md:flex-row items-center gap-8 p-8">
      <div className="w-24 h-24 rounded-3xl bg-sky-100 flex items-center justify-center text-sky-500">
        <User className="w-12 h-12" />
      </div>

      <div className="flex flex-col gap-4 text-center md:text-left">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{user.displayName}</h1>
          <p className="text-slate-500 font-medium">Student Reader</p>
        </div>

        <div className="flex flex-wrap justify-center md:justify-start gap-6">
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-4 h-4 text-sky-500" />
            <span className="text-sm">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Hash className="w-4 h-4 text-sky-500" />
            <span className="text-sm">ID: {user.studentId}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Shield className="w-4 h-4 text-sky-500" />
            <span className="text-sm capitalize">{user.role}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

