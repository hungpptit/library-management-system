/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { ProfileHeader } from './ProfileHeader';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import { Settings, Shield, Bell, HelpCircle, User as UserIcon, Edit2, Save, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface UserProfileViewProps {
  user: UserProfile;
  onUpdateUser: (data: Partial<UserProfile>) => Promise<void>;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user.displayName,
    studentId: user.studentId,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const settings = [
    { label: 'Account Settings', icon: UserIcon, color: 'text-sky-500' },
    { label: 'Security & Privacy', icon: Shield, color: 'text-emerald-500' },
    { label: 'Notifications', icon: Bell, color: 'text-amber-500' },
    { label: 'Help & Support', icon: HelpCircle, color: 'text-slate-500' },
  ];

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onUpdateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center justify-between">
        <ProfileHeader user={user} />
        {!isEditing ? (
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              isLoading={isSubmitting}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <SectionHeader
            title={isEditing ? "Edit Information" : "Account Preferences"}
            subtitle={isEditing ? "Update your personal details" : "Manage your profile and settings"}
          />
          
          {isEditing ? (
            <Card className="p-6 flex flex-col gap-6">
              <Input
                label="Display Name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Enter your name"
              />
              <Input
                label="Student ID"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="Enter your student ID"
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone"
              />
              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your address"
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {settings.map((item) => {
                const Icon = item.icon as any;
                return (
                  <Card key={item.label} hoverable className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-slate-50 ${item.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-slate-900">{item.label}</span>
                    </div>
                    <Settings className="w-5 h-5 text-slate-300" />
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8">
          <SectionHeader
            title="Library Statistics"
            subtitle="Your reading habits and activity"
          />
          <div className="grid grid-cols-2 gap-6">
            <Card className="flex flex-col gap-2 p-6 text-center">
              <span className="text-3xl font-bold text-sky-500">12</span>
              <span className="text-sm font-medium text-slate-500">Books Read</span>
            </Card>
            <Card className="flex flex-col gap-2 p-6 text-center">
              <span className="text-3xl font-bold text-emerald-500">3</span>
              <span className="text-sm font-medium text-slate-500">Active Loans</span>
            </Card>
            <Card className="flex flex-col gap-2 p-6 text-center">
              <span className="text-3xl font-bold text-amber-500">0</span>
              <span className="text-sm font-medium text-slate-500">Overdue</span>
            </Card>
            <Card className="flex flex-col gap-2 p-6 text-center">
              <span className="text-3xl font-bold text-slate-500">4.8</span>
              <span className="text-sm font-medium text-slate-500">Avg Rating</span>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

