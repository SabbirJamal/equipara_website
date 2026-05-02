'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import SmartHeader from '@/components/layout/SmartHeader';
import { Calendar, MapPin, User, Phone, Building2, Clock, Package } from 'lucide-react';
import styles from './page.module.css';

interface Booking {
  id: string;
  buyer_name?: string;
  buyer_phone?: string;
  listing_name: string;
  listing_photo?: string;
  seller_company?: string;
  seller_phone?: string;
  start_date: string;
  end_date: string;
  pickup_location: string;
  delivery_location: string;
  notes: string;
  status: string;
  created_at: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewAs, setViewAs] = useState<'buyer' | 'seller'>('buyer');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (profile) {
      // default to seller view if user is seller
      if (profile.is_seller) {
        setViewAs('seller');
      }
      loadBookings();
    }
  }, [user, profile, authLoading]);

  const loadBookings = async () => {
    if (!user || !profile) return;
    setLoading(true);

    if (profile.is_seller) {
      // get seller profile id
      const { data: sellerProfile } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (sellerProfile) {
        const { data } = await supabase.rpc('get_seller_bookings', {
          p_seller_profile_id: sellerProfile.id,
        });
        if (data) setBookings(data);
      }
    } else {
      const { data } = await supabase.rpc('get_buyer_bookings', {
        p_buyer_id: user.id,
      });
      if (data) setBookings(data);
    }

    setLoading(false);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase.rpc('update_booking_status', {
      p_booking_id: bookingId,
      p_new_status: newStatus,
    });

    if (error) {
      alert('Failed to update status');
      return;
    }

    // refresh list
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: newStatus } : b
    ));
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const flow: Record<string, string> = {
      'pending': 'accepted',
      'accepted': 'dispatched',
      'dispatched': 'delivered',
      'delivered': 'completed',
    };
    return flow[currentStatus] || null;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'pending': '#f59e0b',
      'accepted': '#3b82f6',
      'dispatched': '#8b5cf6',
      'delivered': '#10b981',
      'completed': '#059669',
      'rejected': '#ef4444',
      'cancelled': '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const pendingBookings = bookings.filter(b => 
    ['pending', 'accepted', 'dispatched', 'delivered'].includes(b.status)
  );

  const historyBookings = bookings.filter(b => 
    ['completed', 'rejected', 'cancelled'].includes(b.status)
  );

  const currentBookings = activeTab === 'pending' ? pendingBookings : historyBookings;

  if (authLoading) {
    return (
      <div className={styles.page}>
        <SmartHeader />
        <div className={styles.loading}><div className={styles.spinner}></div></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <SmartHeader />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <Package className="w-6 h-6" />
            {viewAs === 'seller' ? 'Incoming Orders' : 'My Orders'}
          </h1>
          
          {/* buyer/seller toggle for users who are both */}
          {profile?.is_buyer && profile?.is_seller && (
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${viewAs === 'buyer' ? styles.viewActive : ''}`}
                onClick={() => setViewAs('buyer')}
              >
                My Orders
              </button>
              <button
                className={`${styles.viewBtn} ${viewAs === 'seller' ? styles.viewActive : ''}`}
                onClick={() => setViewAs('seller')}
              >
                Incoming Orders
              </button>
            </div>
          )}
        </div>

        {/* tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'pending' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingBookings.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Order History ({historyBookings.length})
          </button>
        </div>

        {/* booking list */}
        {loading ? (
          <div className={styles.loading}><div className={styles.spinner}></div></div>
        ) : currentBookings.length === 0 ? (
          <div className={styles.empty}>
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <h2>No {activeTab === 'pending' ? 'pending' : 'past'} orders</h2>
            <p>
              {viewAs === 'seller' 
                ? 'When buyers request your equipment, they will appear here.'
                : 'Browse listings and request items to see your orders here.'}
            </p>
          </div>
        ) : (
          <div className={styles.bookingList}>
            {currentBookings.map((booking) => (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <div className={styles.bookingInfo}>
                    {booking.listing_photo ? (
                      <img src={booking.listing_photo} alt="" className={styles.bookingThumb} />
                    ) : (
                      <div className={styles.noThumb}></div>
                    )}
                    <div>
                      <h3 className={styles.bookingTitle}>{booking.listing_name}</h3>
                      <p className={styles.bookingDate}>
                        <Calendar className="w-3 h-3" />
                        {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                      </p>
                    </div>
                  </div>
                  <span 
                    className={styles.statusBadge}
                    style={{ background: getStatusColor(booking.status) + '20', color: getStatusColor(booking.status) }}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className={styles.bookingDetails}>
                  {/* buyer/seller info */}
                  {viewAs === 'seller' && booking.buyer_name && (
                    <div className={styles.detailRow}>
                      <User className="w-4 h-4" />
                      <span>{booking.buyer_name}</span>
                      {booking.buyer_phone && (
                        <>
                          <Phone className="w-4 h-4 ml-3" />
                          <span>{booking.buyer_phone}</span>
                        </>
                      )}
                    </div>
                  )}

                  {viewAs === 'buyer' && booking.seller_company && (
                    <div className={styles.detailRow}>
                      <Building2 className="w-4 h-4" />
                      <span>{booking.seller_company}</span>
                      {booking.seller_phone && (
                        <>
                          <Phone className="w-4 h-4 ml-3" />
                          <span>{booking.seller_phone}</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* locations */}
                  <div className={styles.detailRow}>
                    <MapPin className="w-4 h-4" />
                    <span>Pickup: {booking.pickup_location}</span>
                    <MapPin className="w-4 h-4 ml-3" />
                    <span>Delivery: {booking.delivery_location}</span>
                  </div>

                  {/* notes */}
                  {booking.notes && (
                    <div className={styles.notes}>
                      <p>"{booking.notes}"</p>
                    </div>
                  )}
                </div>

                {/* seller actions */}
                {viewAs === 'seller' && activeTab === 'pending' && (
                  <div className={styles.actions}>
                    {booking.status === 'pending' && (
                      <>
                        <button
                          className={styles.rejectBtn}
                          onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                        >
                          Reject
                        </button>
                        <button
                          className={styles.acceptBtn}
                          onClick={() => handleStatusUpdate(booking.id, 'accepted')}
                        >
                          Accept
                        </button>
                      </>
                    )}
                    {getNextStatus(booking.status) && booking.status !== 'pending' && (
                      <button
                        className={styles.updateBtn}
                        onClick={() => handleStatusUpdate(booking.id, getNextStatus(booking.status)!)}
                      >
                        Mark as {getNextStatus(booking.status)}
                      </button>
                    )}
                  </div>
                )}

                {/* buyer cancel */}
                {viewAs === 'buyer' && activeTab === 'pending' && ['pending', 'accepted'].includes(booking.status) && (
                  <div className={styles.actions}>
                    <button
                      className={styles.rejectBtn}
                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}