'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import SmartHeader from '@/components/layout/SmartHeader';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { MapPin, Clock, ArrowRight, Heart } from 'lucide-react';
import styles from './page.module.css';

interface FavoriteListing {
  id: string;
  sub_type: string;
  name: string;
  brand: string;
  year: number;
  location_city: string;
  daily_rate_omr: number;
  photos: string[];
  company_name: string;
  saved_at: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadFavorites();
    }
  }, [user, authLoading]);

  const loadFavorites = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('favourites')
      .select(`
        id,
        saved_at,
        fleet_listings (
          id,
          sub_type,
          name,
          brand,
          year,
          location_city,
          daily_rate_omr,
          photos,
          seller_profiles (company_name)
        )
      `)
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map((item: any) => ({
        id: item.fleet_listings.id,
        sub_type: item.fleet_listings.sub_type,
        name: item.fleet_listings.name,
        brand: item.fleet_listings.brand,
        year: item.fleet_listings.year,
        location_city: item.fleet_listings.location_city,
        daily_rate_omr: item.fleet_listings.daily_rate_omr,
        photos: item.fleet_listings.photos,
        company_name: item.fleet_listings.seller_profiles?.company_name || 'Unknown',
        saved_at: item.saved_at,
      }));
      setFavorites(mapped);
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className={styles.page}>
        <SmartHeader />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <SmartHeader />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <Heart className="w-6 h-6 fill-red-500 text-red-500" />
            My Favorites
          </h1>
          <p className={styles.subtitle}>{favorites.length} saved listing{favorites.length !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className={styles.empty}>
            <Heart className="w-16 h-16 text-gray-300 mb-4" />
            <h2>No favorites yet</h2>
            <p>Browse listings and click the heart to save them here.</p>
            <Link href="/" className={styles.browseBtn}>
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {favorites.map((listing) => (
              <Link href={`/listing/${listing.id}`} key={listing.id} className={styles.card}>
                <div className={styles.cardImage}>
                  {listing.photos && listing.photos.length > 0 ? (
                    <img src={listing.photos[0]} alt={listing.name} className={styles.image} />
                  ) : (
                    <div className={styles.placeholder}>No Image</div>
                  )}
                  <span className={styles.typeTag}>{listing.sub_type?.replace(/_/g, ' ')}</span>
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 10 }}>
                    <FavoriteButton listingId={listing.id} size="sm" />
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{listing.name}</h3>
                  {listing.company_name && (
                    <p className={styles.company}>{listing.company_name}</p>
                  )}
                  <div className={styles.cardDetails}>
                    <div className={styles.detail}>
                      <MapPin className="w-4 h-4" />
                      <span>{listing.location_city}</span>
                    </div>
                    {listing.year && (
                      <div className={styles.detail}>
                        <Clock className="w-4 h-4" />
                        <span>{listing.year}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardFooter}>
                    <div className={styles.price}>
                      <span className={styles.priceValue}>{listing.daily_rate_omr}</span>
                      <span className={styles.priceUnit}>OMR / day</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}