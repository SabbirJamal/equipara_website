'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { equipmentTypes, specOptions, SpecOption } from '@/lib/equipment-types';
import SmartHeader from '@/components/layout/SmartHeader';
import { MapPin, Clock, ArrowRight, Sun, Moon, Search, X } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';
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
  photos: string[];
  company_name: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // theme
  const [clientTheme, setClientTheme] = useState(false);
  
  // filters
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [subType, setSubType] = useState(searchParams.get('type') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [specs, setSpecs] = useState<Record<string, string>>({});
  
  // results
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // initialize specs from url
  useEffect(() => {
    const specKeys = ['lift_capacity_tons', 'boom_length_meters', 'deck_length_ft', 'load_capacity_tons', 'max_height_meters', 'axle_count'];
    const initialSpecs: Record<string, string> = {};
    specKeys.forEach(key => {
      const val = searchParams.get(key);
      if (val) initialSpecs[key] = val;
    });
    setSpecs(initialSpecs);
    
    // auto search if coming from homepage
    if (searchParams.get('type')) {
      performSearch();
    }
  }, []);

  const performSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    
    // determine category from sub type
    let cat = category;
    if (!cat && subType) {
      const equipTypes = ['crane', 'forklift', 'excavator', 'loader', 'reach_stacker', 'generator', 'boom_lift', 'manlift'];
      const transportTypes = ['flatbed', 'box_trailer', 'lowbed', 'prime_mover', 'recovery_truck', 'tanker'];
      if (equipTypes.includes(subType)) cat = 'equipment';
      if (transportTypes.includes(subType)) cat = 'transport';
    }

    const { data, error } = await supabase.rpc('get_listings', {
      p_category: cat || null,
      p_sub_type: subType || null,
      p_location: location || null,
      p_brand: brand || null,
      p_year: year || null,
      p_lift_capacity_tons: specs['lift_capacity_tons'] ? parseFloat(specs['lift_capacity_tons']) : null,
      p_boom_length_meters: specs['boom_length_meters'] ? parseFloat(specs['boom_length_meters']) : null,
      p_deck_length_ft: specs['deck_length_ft'] ? parseFloat(specs['deck_length_ft']) : null,
      p_load_capacity_tons: specs['load_capacity_tons'] ? parseFloat(specs['load_capacity_tons']) : null,
      p_max_height_meters: specs['max_height_meters'] ? parseFloat(specs['max_height_meters']) : null,
      p_axle_count: specs['axle_count'] ? parseInt(specs['axle_count']) : null,
      p_search: null,
    });

    if (!error && data) {
      setListings(data);
    }
    setLoading(false);
  };

  const handleApplyFilters = () => {
    // update url params
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (subType) params.set('type', subType);
    if (location) params.set('location', location);
    if (year) params.set('year', year);
    if (brand) params.set('brand', brand);
    Object.entries(specs).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/search?${params.toString()}`);
    performSearch();
  };

  const handleClearFilters = () => {
    setCategory('');
    setSubType('');
    setLocation('');
    setYear('');
    setBrand('');
    setSpecs({});
    router.push('/search');
  };

  const currentSpecs = specOptions[subType] || [];
  const omanCities = ['Muscat', 'Sohar', 'Salalah', 'Nizwa', 'Sur', 'Buraimi', 'Ibri', 'Rustaq', 'Barka', 'Khasab'];
  const years = Array.from({ length: 30 }, (_, i) => (2026 - i).toString());
  const brands = ['Caterpillar', 'Liebherr', 'Komatsu', 'Volvo', 'Hitachi', 'JCB', 'Mercedes', 'MAN', 'Scania'];

  const themeClass = clientTheme ? styles.clientTheme : styles.light;

  return (
    <div className={`${styles.page} ${themeClass}`}>
      <SmartHeader />
      
      <div className={styles.content}>
        {/* sidebar filters */}
        <aside className={styles.sidebar}>
          {/* theme toggle */}
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>Filters</h3>
            <button 
              onClick={() => setClientTheme(!clientTheme)} 
              className={styles.themeToggle}
              title={clientTheme ? 'Switch to light mode' : 'Switch to client theme'}
            >
              {clientTheme ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* category */}
          <div className={styles.filterGroup}>
            <h4 className={styles.filterLabel}>Category</h4>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="radio"
                  name="category"
                  value="equipment"
                  checked={category === 'equipment'}
                  onChange={(e) => { setCategory(e.target.value); setSubType(''); }}
                  className={styles.checkbox}
                />
                <span>Equipment</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="radio"
                  name="category"
                  value="transport"
                  checked={category === 'transport'}
                  onChange={(e) => { setCategory(e.target.value); setSubType(''); }}
                  className={styles.checkbox}
                />
                <span>Transport</span>
              </label>
            </div>
          </div>

          {/* type */}
          <div className={styles.filterGroup}>
            <h4 className={styles.filterLabel}>Type</h4>
            <div className={styles.checkboxGroup}>
              {equipmentTypes
                .filter(t => !category || t.category === category)
                .map(type => (
                  <label key={type.value} className={styles.checkboxLabel}>
                    <input
                      type="radio"
                      name="subType"
                      value={type.value}
                      checked={subType === type.value}
                      onChange={(e) => setSubType(e.target.value)}
                      className={styles.checkbox}
                    />
                    <span>{type.label}</span>
                  </label>
                ))}
            </div>
          </div>

          {/* location */}
          <div className={styles.filterGroup}>
            <h4 className={styles.filterLabel}>Location</h4>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Any Location</option>
              {omanCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* brand */}
          <div className={styles.filterGroup}>
            <h4 className={styles.filterLabel}>Brand</h4>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Any Brand</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* year */}
          <div className={styles.filterGroup}>
            <h4 className={styles.filterLabel}>Year</h4>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Any Year</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* specs */}
          {subType && currentSpecs.length > 0 && (
            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Specifications</h4>
              {currentSpecs.map((spec: SpecOption) => (
                <div key={spec.key} className={styles.specInput}>
                  <label className={styles.specInputLabel}>
                    {spec.label} {spec.unit && `(${spec.unit})`} min
                  </label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={specs[spec.key] || ''}
                    onChange={(e) => setSpecs(prev => ({ ...prev, [spec.key]: e.target.value }))}
                    className={styles.filterSelect}
                  />
                </div>
              ))}
            </div>
          )}

          {/* action buttons */}
          <div className={styles.sidebarActions}>
            <button onClick={handleApplyFilters} className={styles.applyBtn}>
              <Search className="w-4 h-4" />
              Apply Filters
            </button>
            <button onClick={handleClearFilters} className={styles.clearBtn}>
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </aside>

        {/* results */}
        <main className={styles.results}>
          {!hasSearched ? (
            <div className={styles.welcomeMessage}>
              <h2>Find Equipment & Transport</h2>
              <p>Use the filters on the left to search for available listings.</p>
              <button onClick={performSearch} className={styles.browseAllBtn}>
                Browse All Listings
              </button>
            </div>
          ) : loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
            </div>
          ) : listings.length === 0 ? (
            <div className={styles.empty}>
              <h2>No listings found</h2>
              <p>Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className={styles.resultsHeader}>
                <p className={styles.resultsCount}>{listings.length} listing{listings.length !== 1 ? 's' : ''} found</p>
              </div>
              <div className={styles.grid}>
                {listings.map((listing) => (
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
                      {listing.company_name && <p className={styles.company}>{listing.company_name}</p>}
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
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className={styles.page}><div className={styles.loading}><div className={styles.spinner}></div></div></div>}>
      <SearchContent />
    </Suspense>
  );
}