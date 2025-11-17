'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { User as UserIcon, Building2, Users, Shield, Mail, Key, Edit, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show nothing if not authenticated (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mono-bold mb-2">
                Profile
              </h1>
              <p className="text-gray-400 sans-clean">
                Manage your account information and settings
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all tech-mono text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Card */}
            <div className="bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="text-center">
                {/* Avatar */}
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500/20 to-emerald-500/20 flex items-center justify-center border-2 border-white/10">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <UserIcon className="w-10 h-10 text-sky-400" />
                    )}
                  </div>
                </div>

                {/* User Name */}
                <h2 className="text-2xl font-bold text-white mono-bold mb-1">
                  {user.name}
                </h2>

                {/* Role Badge */}
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-sky-500/15 border border-sky-500/30 rounded-full">
                  <Shield className="w-3 h-3 text-sky-400" />
                  <span className="text-xs text-sky-400 tech-mono uppercase">
                    {user.role}
                  </span>
                </div>

                {/* Email */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="tech-mono">{user.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tech-mono mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => alert('Edit Profile - Mock functionality')}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all text-left group"
                >
                  <Edit className="w-4 h-4 text-gray-400 group-hover:text-sky-400 transition-colors" />
                  <span className="text-sm text-gray-300 group-hover:text-white tech-mono">
                    Edit Profile
                  </span>
                </button>
                <button
                  onClick={() => alert('Change Password - Mock functionality')}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all text-left group"
                >
                  <Key className="w-4 h-4 text-gray-400 group-hover:text-sky-400 transition-colors" />
                  <span className="text-sm text-gray-300 group-hover:text-white tech-mono">
                    Change Password
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all text-left group"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400 tech-mono">
                    Sign Out
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Information */}
            <div className="bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border border-white/10">
                  <UserIcon className="w-5 h-5 text-sky-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mono-bold">
                  User Information
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0a0a0a] rounded-lg border border-white/5">
                  <p className="text-xs text-gray-500 tech-mono mb-1">Full Name</p>
                  <p className="text-base text-white sans-clean">{user.name}</p>
                </div>
                <div className="p-4 bg-[#0a0a0a] rounded-lg border border-white/5">
                  <p className="text-xs text-gray-500 tech-mono mb-1">Email Address</p>
                  <p className="text-base text-white sans-clean">{user.email}</p>
                </div>
                <div className="p-4 bg-[#0a0a0a] rounded-lg border border-white/5">
                  <p className="text-xs text-gray-500 tech-mono mb-1">User ID</p>
                  <p className="text-base text-white tech-mono">{user.id}</p>
                </div>
                <div className="p-4 bg-[#0a0a0a] rounded-lg border border-white/5">
                  <p className="text-xs text-gray-500 tech-mono mb-1">Account Role</p>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 bg-sky-500/15 border border-sky-500/30 rounded-full">
                    <Shield className="w-3 h-3 text-sky-400" />
                    <span className="text-xs text-sky-400 tech-mono uppercase">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Farm/Company Information */}
            <div className="bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-white/10">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mono-bold">
                  Farm Information
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#0a0a0a] rounded-lg border border-white/5">
                  <p className="text-xs text-gray-500 tech-mono mb-1">Farm Name</p>
                  <p className="text-lg text-white sans-clean font-semibold">{user.farm.name}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#0a0a0a] rounded-lg border border-white/5">
                    <p className="text-xs text-gray-500 tech-mono mb-2">Farm ID</p>
                    <p className="text-base text-white tech-mono">{user.farm.id}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-sky-500/10 to-cyan-500/10 rounded-lg border border-sky-500/20">
                    <p className="text-xs text-sky-400 tech-mono mb-2">Total Seats</p>
                    <p className="text-2xl text-white font-bold mono-bold">{user.farm.totalSeats}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-lg border border-emerald-500/20">
                    <p className="text-xs text-emerald-400 tech-mono mb-2">Active Members</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl text-white font-bold mono-bold">{user.farm.activeMembers}</p>
                      <Users className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* Seat Usage Bar */}
                <div className="p-4 bg-[#0a0a0a] rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 tech-mono">Seat Usage</p>
                    <p className="text-xs text-gray-400 tech-mono">
                      {user.farm.activeMembers} / {user.farm.totalSeats} used
                    </p>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${(user.farm.activeMembers / user.farm.totalSeats) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Settings (Mock) */}
            <div className="bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-white mono-bold mb-4">
                Account Settings
              </h3>
              <p className="text-sm text-gray-400 sans-clean mb-6">
                Manage your account preferences and security settings
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => alert('Notification Settings - Mock functionality')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all text-left group"
                >
                  <span className="text-sm text-gray-300 group-hover:text-white tech-mono">
                    Notification Preferences
                  </span>
                  <Edit className="w-4 h-4 text-gray-400 group-hover:text-sky-400 transition-colors" />
                </button>
                <button
                  onClick={() => alert('Privacy Settings - Mock functionality')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all text-left group"
                >
                  <span className="text-sm text-gray-300 group-hover:text-white tech-mono">
                    Privacy & Security
                  </span>
                  <Edit className="w-4 h-4 text-gray-400 group-hover:text-sky-400 transition-colors" />
                </button>
                <button
                  onClick={() => alert('API Access - Mock functionality')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all text-left group"
                >
                  <span className="text-sm text-gray-300 group-hover:text-white tech-mono">
                    API Access & Tokens
                  </span>
                  <Edit className="w-4 h-4 text-gray-400 group-hover:text-sky-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
