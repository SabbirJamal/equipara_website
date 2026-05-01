'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, MessageSquare, User, ChevronDown, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface DashboardHeaderProps {
  fullName: string;
  isSeller: boolean;
  isBuyer: boolean;
  currentView: 'buyer' | 'seller';
  onSwitchView: () => void;
}

export default function DashboardHeader({ 
  fullName, 
  isSeller, 
  isBuyer, 
  currentView, 
  onSwitchView 
}: DashboardHeaderProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSwitchClick = () => {
    setProfileOpen(false);
    
    if (currentView === 'buyer') {
      // Switching to seller view
      if (isSeller) {
        onSwitchView(); // Already registered, just switch view
      } else {
        router.push('/become-seller'); // Not registered, redirect to form
      }
    } else {
      // Switching to buyer view
      onSwitchView();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center">
            <a href="/dashboard" className="text-xl font-bold">
              <span className="text-gray-800">Equi</span>
              <span className="text-amber-500">para</span>
            </a>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-3">
            {/* Bell Icon */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Chat Icon */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <MessageSquare className="w-5 h-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setProfileOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-2">
                    {/* User Name */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{fullName}</p>
                      <p className="text-xs text-gray-500">
                        {currentView === 'buyer' ? 'Buyer Account' : 'Seller Account'}
                      </p>
                    </div>

                    {/* Account Settings */}
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                      Account Settings
                    </button>

                    {/* Switch Account */}
                    {(isBuyer && isSeller) || (!isSeller && currentView === 'buyer') ? (
                      <button
                        onClick={handleSwitchClick}
                        className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition font-medium"
                      >
                        {currentView === 'buyer' 
                          ? (isSeller ? 'Switch to Seller' : 'Become a Seller')
                          : 'Switch to Buyer'
                        }
                      </button>
                    ) : null}

                    {/* Logout */}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}