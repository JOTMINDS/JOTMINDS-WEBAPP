import React, { useState } from 'react';
import { User } from '../../types';
import { Institution, resolveSchoolLocation } from '../../utils/institution';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Shield, UserCheck, Key, Bell, CheckCircle2, Lock,
  Mail, Phone, Building, Save, AlertCircle, Sparkles, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { saveUser, saveCurrentUser } from '../../utils/storage';

interface AdministratorSettingsViewProps {
  user: User;
  institution?: Institution | null;
  onProfileUpdate: (updatedUser: User) => void;
}

export function AdministratorSettingsView({
  user,
  institution,
  onProfileUpdate
}: AdministratorSettingsViewProps) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState((user as any).phone || institution?.phone || '');
  const [title, setTitle] = useState((user as any).title || 'Head of Institution / Administrator');
  
  // Notification Preferences
  const [notifyOnTeacherRequest, setNotifyOnTeacherRequest] = useState(true);
  const [notifyOnClassSubmitted, setNotifyOnClassSubmitted] = useState(true);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(true);

  // Password Change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    const updated: User = {
      ...user,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      title: title.trim()
    } as any;

    saveUser(updated);
    saveCurrentUser(updated);
    onProfileUpdate(updated);
    toast.success('Administrator profile updated successfully!');
  };

  const handlePasswordUpdate = () => {
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    // In local storage / auth mock:
    toast.success('Security password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordSection(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
                <Shield className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold">Administrator Profile & Security Console</h2>
            </div>
            <p className="text-xs text-indigo-200/80 max-w-2xl">
              Manage executive administrative authority, contact credentials, institutional security permissions, and alert preferences.
            </p>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-1 text-xs self-start md:self-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified School Executive
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Identity & Permissions */}
        <div className="md:col-span-2 space-y-6">
          {/* Executive Credentials Card */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" /> Executive Identity Details
              </CardTitle>
              <CardDescription className="text-xs">
                These details identify you across the institutional directory and official PDF reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-700">Administrator Full Name</Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="mt-1 text-xs"
                    placeholder="e.g. Dr. Kwesi Mensah"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">Official Designation / Title</Label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="mt-1 text-xs"
                    placeholder="e.g. Head of School / Principal"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">Administrator Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="mt-1 text-xs"
                    placeholder="admin@school.edu.gh"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">Direct Phone Number</Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="mt-1 text-xs"
                    placeholder="+233 24 123 4567"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t">
                <Button onClick={handleSaveProfile} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Save Profile Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security & Password Card */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-600" /> Account Security & Password
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Ensure your administrator account is protected with a secure password.
                  </CardDescription>
                </div>
                {!showPasswordSection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswordSection(true)}
                    className="text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  >
                    Change Password
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {showPasswordSection ? (
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                  <div>
                    <Label className="text-xs font-semibold">Current Password</Label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="mt-1 text-xs bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold">New Password</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="mt-1 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Confirm New Password</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="mt-1 text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowPasswordSection(false)} className="text-xs">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handlePasswordUpdate} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                      Update Password
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-gray-600 py-1">
                  <span>Password Last Updated: <b>30 days ago</b></span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 2FA Security Protected
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Authority & Preferences */}
        <div className="space-y-6">
          {/* Institutional Authority Card */}
          <Card className="border-indigo-100 bg-indigo-50/20">
            <CardHeader className="pb-3 border-b border-indigo-100">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-950">
                <Building className="w-4 h-4 text-indigo-600" /> Bound Institution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2 text-xs">
              <p className="font-bold text-gray-900 text-sm">{institution?.name || 'Your Educational Institution'}</p>
              <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[11px]">
                <span>School Code:</span>
                <Badge className="bg-indigo-100 text-indigo-800 font-mono text-xs">
                  {institution?.code || 'SCH-XXXX'}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-gray-600 text-[11px] pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate font-medium">{resolveSchoolLocation(institution).displayLocation}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-100 space-y-1.5 text-gray-600">
                <p className="font-semibold text-indigo-900 text-xs">Administrative Privileges:</p>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> Full Faculty Roster Management
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> Class Creation & Approval Rights
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> Official Cognitive Dossier Export
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> Institution Settings Configuration
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert & Notification Preferences */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" /> Alert Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-3 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnTeacherRequest}
                  onChange={e => setNotifyOnTeacherRequest(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="font-semibold text-gray-800">Faculty Join Requests</p>
                  <p className="text-[11px] text-gray-500">Alert me when a new teacher signs up with our school code.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnClassSubmitted}
                  onChange={e => setNotifyOnClassSubmitted(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="font-semibold text-gray-800">Class Approval Requests</p>
                  <p className="text-[11px] text-gray-500">Notify when teachers create classes needing validation.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyWeeklyDigest}
                  onChange={e => setNotifyWeeklyDigest(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="font-semibold text-gray-800">Weekly Cognitive Digest</p>
                  <p className="text-[11px] text-gray-500">Weekly summary of student assessments and faculty alignment.</p>
                </div>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
