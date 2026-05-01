'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { equipmentTypes } from '@/lib/equipment-types';
import { Search, MapPin, Clock, ArrowRight } from 'lucide-react';
import styles from './ListingsGrid.module.css';
import FavoriteButton from '@/components/ui/FavoriteButton';

interface Listing {
  id: string;
  category: string;
  sub_type: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  location_city: string;
  daily_rate_omr: number;
  weekly_rate_omr?: number;
  monthly_rate_omr?: number;
  photos: string[];
  company_name: string;
  created_at: string;
}

interface ListingsGridProps {
  sellerId?: string;
  showFilters?: boolean;
  defaultCategory?: string;
}

export default function ListingsGrid({ sellerId, showFilters = true, defaultCategory = '' }: ListingsGridProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: defaultCategory,
    sub_type: '',
    location: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // update filters when defaultCategory changes
  useEffect(() => {
    if (defaultCategory) {
      setFilters(prev => ({ ...prev, category: defaultCategory, sub_type: '' }));
    }
  }, [defaultCategory]);

  // load listings when filters change
  useEffect(() => {
    loadListings();
  }, [filters, sellerId]);

  const loadListings = async () => {
    setLoading(true);
    
    if (sellerId) {
      const { data, error } = await supabase
        .from('fleet_listings')
        .select('*, seller_profiles(company_name)')
        .eq('seller_profile_id', sellerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map((item: any) => ({
          ...item,
          company_name: item.seller_profiles?.company_name || 'Unknown'
        }));
        setListings(mapped);
      }
    } else {
      const { data, error } = await supabase.rpc('get_listings', {
        p_category: filters.category || null,
        p_sub_type: filters.sub_type || null,
        p_location: filters.location || null,
        p_search: searchTerm || null,
      });

      if (!error && data) {
        setListings(data);
      }
    }
    
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadListings();
  };

  const omanCities = ['Muscat', 'Sohar', 'Salalah', 'Nizwa', 'Sur', 'Buraimi', 'Ibri', 'Rustaq', 'Barka', 'Khasab'];

  return (
    <div>
      {/* search & filters */}
      {showFilters && !sellerId && (
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </form>

            <div className={styles.filters}>
              <select
                className={styles.filterSelect}
                value={filters.category}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, category: e.target.value, sub_type: '' }));
                }}
              >
                <option value="">All Categories</option>
                <option value="equipment">Equipment</option>
                <option value="transport">Transport</option>
              </select>

              <select
                className={styles.filterSelect}
                value={filters.sub_type}
                onChange={(e) => setFilters(prev => ({ ...prev, sub_type: e.target.value }))}
              >
                <option value="">All Types</option>
                {equipmentTypes
                  .filter(t => !filters.category || t.category === filters.category)
                  .map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
              </select>

              <select
                className={styles.filterSelect}
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              >
                <option value="">All Locations</option>
                {omanCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* listings grid */}
      <div className={styles.listingsGrid}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className={styles.empty}>
            <h2>No listings found</h2>
            <p>{sellerId ? "You haven't added any listings yet." : "Try adjusting your filters or check back later."}</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {listings.map((listing) => (
              <Link href={`/listing/${listing.id}`} key={listing.id} className={styles.card}>
                <div className={styles.cardImage}>
                  {listing.photos && listing.photos.length > 0 ? (
                    <img src={listing.photos[0]} alt={listing.name} className={styles.image} />
                  ) : (
                    <div className={styles.placeholder}>No Image</div>
                  )}
                  
                  {/* heart shaped icon for favourites */}
                  <span className={styles.category}>{listing.sub_type?.replace(/_/g, ' ')}</span>
                  <div className="absolute top-2 right-2 z-10">
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