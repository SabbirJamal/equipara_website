'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { MapPin, Clock, Edit, Trash2, Plus } from 'lucide-react';
import styles from './SellerDashboard.module.css';

interface SellerListing {
  id: string;
  category: string;
  sub_type: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  location_city: string;
  daily_rate_omr: number;
  photos: string[];
  is_active: boolean;
  created_at: string;
}

export default function SellerDashboard() {
  const router = useRouter();
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerProfileId, setSellerProfileId] = useState<string>('');

  useEffect(() => {
    loadSellerData();
  }, []);

  const loadSellerData = async () => {
    // get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // get seller profile id
    const { data: sellerProfile } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (sellerProfile) {
      setSellerProfileId(sellerProfile.id);
      loadListings(sellerProfile.id);
    }
  };

  const loadListings = async (profileId: string) => {
    const { data, error } = await supabase
      .from('fleet_listings')
      .select('*')
      .eq('seller_profile_id', profileId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setListings(data);
    }
    setLoading(false);
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    const { error } = await supabase
      .from('fleet_listings')
      .delete()
      .eq('id', listingId);

    if (error) {
      alert('Failed to delete listing');
      return;
    }

    // refresh list
    setListings(prev => prev.filter(l => l.id !== listingId));
  };

  const handleToggleActive = async (listingId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('fleet_listings')
      .update({ is_active: !currentStatus })
      .eq('id', listingId);

    if (error) {
      alert('Failed to update listing');
      return;
    }

    // refresh list
    setListings(prev => prev.map(l => 
      l.id === listingId ? { ...l, is_active: !currentStatus } : l
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>My Listings</h2>
          <p className={styles.subtitle}>Manage your equipment and transport listings</p>
        </div>
        <Link href="/add-listing" className={styles.addBtn}>
          <Plus className="w-5 h-5" />
          Add New Listing
        </Link>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      ) : listings.length === 0 ? (
        <div className={styles.empty}>
          <h3>No listings yet</h3>
          <p>Start by adding your first equipment or transport listing.</p>
          <Link href="/add-listing" className={styles.addBtn}>
            <Plus className="w-5 h-5" />
            Add New Listing
          </Link>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Listing</th>
                <th>Type</th>
                <th>Location</th>
                <th>Daily Rate</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id}>
                  <td>
                    <div className={styles.listingInfo}>
                      {listing.photos && listing.photos[0] ? (
                        <img src={listing.photos[0]} alt="" className={styles.listingThumb} />
                      ) : (
                        <div className={styles.noThumb}></div>
                      )}
                      <div>
                        <div className={styles.listingName}>{listing.name}</div>
                        {listing.brand && (
                          <div className={styles.listingMeta}>{listing.brand} {listing.model}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.typeBadge}>{listing.sub_type}</span>
                  </td>
                  <td>
                    <div className={styles.cellWithIcon}>
                      <MapPin className="w-4 h-4" />
                      {listing.location_city}
                    </div>
                  </td>
                  <td>
                    <span className={styles.price}>{listing.daily_rate_omr} OMR</span>
                  </td>
                  <td>
                    <button
                      className={`${styles.statusBtn} ${listing.is_active ? styles.active : styles.inactive}`}
                      onClick={() => handleToggleActive(listing.id, listing.is_active)}
                    >
                      {listing.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>{formatDate(listing.created_at)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => router.push(`/listing/${listing.id}/edit`)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDelete(listing.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}