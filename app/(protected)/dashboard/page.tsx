'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import SmartHeader from '@/components/layout/SmartHeader';
import BuyerDashboard from './BuyerDashboard';
import SellerDashboard from './SellerDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'buyer' | 'seller'>('buyer');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      // if user is only a seller, default to seller view
      if (profile.is_seller && !profile.is_buyer) {
        setCurrentView('seller');
      }
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const handleSwitchView = () => {
    setCurrentView(prev => prev === 'buyer' ? 'seller' : 'buyer');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SmartHeader 
        currentView={currentView}
        onSwitchView={handleSwitchView}
      />
      
      {currentView === 'buyer' ? <BuyerDashboard /> : <SellerDashboard />}
    </div>
  );
}