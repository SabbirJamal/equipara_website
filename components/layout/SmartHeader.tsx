'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, MessageSquare, User, ChevronDown, LogOut, Package, Heart } from 'lucide-react';
import styles from './SmartHeader.module.css';
import { supabase } from '@/lib/supabase/client';
import NotificationBell from '@/components/layout/NotificationBell';


interface SmartHeaderProps {
  currentView?: 'buyer' | 'seller';
  onSwitchView?: () => void;
}

export default function SmartHeader({ currentView, onSwitchView }: SmartHeaderProps) {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    setProfileOpen(false);
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleSwitchClick = () => {
    setProfileOpen(false);
    
    if (currentView === 'buyer') {
      if (profile?.is_seller && onSwitchView) {
        onSwitchView();
      } else {
        router.push('/become-seller');
      }
    } else if (currentView === 'seller' && onSwitchView) {
      onSwitchView();
    }
  };

  // not logged in header
  if (!user || !profile) {
    return (
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {/* left section */}
          <div className={styles.leftSection}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoText}>Equi</span>
              <span className={styles.logoAccent}>para</span>
            </Link>
            
            {/* nav links */}
            <nav className={styles.navLinks}>
              <Link href="#" className={styles.navLink}>
                Rent/Purchase new
              </Link>
              <Link href="#" className={styles.navLink}>
                Sell Equipments/Transport
              </Link>
            </nav>
          </div>

          {/* right section - profile icon */}
          <div className={styles.profileWrapper}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={styles.profileBtn}
            >
              <div className={styles.avatar}>
                <User className="w-4 h-4 text-white" />
              </div>
            </button>

            {profileOpen && (
              <>
                <div 
                  className={styles.overlay}
                  onClick={() => setProfileOpen(false)}
                ></div>
                <div className={styles.dropdown}>
                  <div className={styles.dropdownMessage}>
                    Register or login to access everything
                  </div>
                  <div className={styles.dropdownDivider}></div>
                  <Link 
                    href="/signup" 
                    className={styles.dropdownItem}
                    onClick={() => setProfileOpen(false)}
                  >
                    Create Account
                  </Link>
                  <Link 
                    href="/login" 
                    className={styles.dropdownItem}
                    onClick={() => setProfileOpen(false)}
                  >
                    Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

  // logged in header
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* left: logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Equi</span>
          <span className={styles.logoAccent}>para</span>
        </Link>

        {/* right: icons */}
        <div className={styles.iconGroup}>
          <NotificationBell />
          <button className={styles.iconBtn}>
            <MessageSquare className="w-5 h-5" />
          </button>

            {/* heart - new */}
          <button className={styles.iconBtn} onClick={() => router.push('/favorites')}>
            <Heart className="w-5 h-5" />
          </button>

          <button className={styles.iconBtn}>
            <MessageSquare className="w-5 h-5" />
          </button>

          <div className={styles.profileWrapper}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={styles.profileBtn}
            >
              <div className={styles.avatar}>
                <User className="w-4 h-4 text-white" />
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>

            {profileOpen && (
              <>
                <div 
                  className={styles.overlay}
                  onClick={() => setProfileOpen(false)}
                ></div>
                <div className={styles.dropdown}>
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>{profile.full_name}</p>
                    <p className={styles.userRole}>
                      {currentView === 'seller' ? 'Seller Account' : 'Buyer Account'}
                    </p>
                  </div>

                  <button className={styles.dropdownItem}>
                    Account Settings
                  </button>

                  {profile.is_seller && (
                    <button 
                      className={styles.dropdownItem}
                      onClick={() => {
                        setProfileOpen(false);
                        router.push('/dashboard');
                      }}
                    >
                      <Package className="w-4 h-4" />
                      My Listings
                    </button>
                  )}

                  {/* orders gyper link */}
                  <button 
                    className={styles.dropdownItem}
                    onClick={() => {
                      setProfileOpen(false);
                      router.push('/orders');
                    }}
                  >
                    <Package className="w-4 h-4" />
                    Orders
                  </button>

                  {(profile.is_buyer && profile.is_seller) || 
                   (!profile.is_seller && currentView === 'buyer') ? (
                    <button
                      onClick={handleSwitchClick}
                      className={`${styles.dropdownItem} ${styles.switchItem}`}
                    >
                      {currentView === 'buyer'
                        ? (profile.is_seller ? 'Switch to Seller' : 'Become a Seller')
                        : 'Switch to Buyer'
                      }
                    </button>
                  ) : null}

                  <div className={styles.dropdownDivider}></div>
                  <button
                    onClick={handleLogout}
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}