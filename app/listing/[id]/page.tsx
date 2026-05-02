'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import SmartHeader from '@/components/layout/SmartHeader';
import RequestFormModal from '@/components/booking/RequestFormModal';
import { MapPin, Calendar, ArrowLeft, Phone, Building2 } from 'lucide-react';
import styles from './page.module.css';

interface ListingDetail {
  id: string;
  seller_profile_id: string;
  category: string;
  sub_type: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  location_city: string;
  daily_rate_omr: number;
  weekly_rate_omr: number;
  monthly_rate_omr: number;
  hours_used: number;
  photos: string[];
  description: string;
  lift_capacity_tons: number;
  boom_length_meters: number;
  deck_length_ft: number;
  load_capacity_tons: number;
  max_height_meters: number;
  axle_count: number;
  additional_specs: Record<string, any>;
  created_at: string;
  company_name: string;
  company_phone: string;
  seller_city: string;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, profile } = useAuth();
  
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    const loadListing = async () => {
      const { data, error } = await supabase.rpc('get_listing_detail', {
        p_listing_id: id,
      });

      if (!error && data && data.length > 0) {
        setListing(data[0]);
      }
      setLoading(false);
    };

    if (id) {
      loadListing();
    }
  }, [id]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const getSpecLabel = (key: string): string => {
    const labels: Record<string, string> = {
      'lift_capacity_tons': 'Lift Capacity',
      'boom_length_meters': 'Boom Length',
      'deck_length_ft': 'Deck Length',
      'load_capacity_tons': 'Load Capacity',
      'max_height_meters': 'Max Height',
      'axle_count': 'Axle Count',
      'max_radius_meters': 'Max Radius',
      'fuel_type': 'Fuel Type',
      'outreach_meters': 'Outreach',
      'deck_height_inches': 'Deck Height',
      'horsepower': 'Horsepower',
      'axle_config': 'Axle Configuration',
      'transmission': 'Transmission',
      'fork_length_mm': 'Fork Length',
      'neck_type': 'Neck Type',
      'capacity_liters': 'Tank Capacity',
      'material': 'Material',
      'power_kva': 'Power Output',
      'operating_weight_tons': 'Operating Weight',
      'bucket_capacity_m3': 'Bucket Capacity',
      'max_dig_depth_meters': 'Max Dig Depth',
      'bed_length_ft': 'Bed Length',
    };
    return labels[key] || key.replace(/_/g, ' ');
  };

  const getSpecUnit = (key: string): string => {
    const units: Record<string, string> = {
      'lift_capacity_tons': 'tons',
      'boom_length_meters': 'm',
      'deck_length_ft': 'ft',
      'load_capacity_tons': 'tons',
      'max_height_meters': 'm',
      'max_radius_meters': 'm',
      'deck_height_inches': 'inches',
      'fork_length_mm': 'mm',
      'outreach_meters': 'm',
      'horsepower': 'HP',
      'capacity_liters': 'liters',
      'power_kva': 'kVA',
      'operating_weight_tons': 'tons',
      'bucket_capacity_m3': 'm³',
      'max_dig_depth_meters': 'm',
      'bed_length_ft': 'ft',
    };
    return units[key] || '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <SmartHeader />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
        </div>
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <SmartHeader />
        <div className={styles.notFound}>
          <h2>Listing not found</h2>
          <Link href="/">Back to Home</Link>
        </div>
      </>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <SmartHeader />
      
      <div className={styles.container}>
        <div className={styles.topBar}>
          <button onClick={handleBack} className={styles.backBtn}>
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        <div className={styles.content}>
          {/* left: photos */}
          <div className={styles.photosSection}>
            <div className={styles.mainPhoto}>
              {listing.photos && listing.photos.length > 0 ? (
                <img 
                  src={listing.photos[selectedPhoto]} 
                  alt={listing.name} 
                  className={styles.mainImage} 
                />
              ) : (
                <div className={styles.noPhoto}>No photos available</div>
              )}
            </div>
            
            {listing.photos && listing.photos.length > 1 && (
              <div className={styles.thumbnailGrid}>
                {listing.photos.map((photo, index) => (
                  <button
                    key={index}
                    className={`${styles.thumbnail} ${index === selectedPhoto ? styles.thumbnailActive : ''}`}
                    onClick={() => setSelectedPhoto(index)}
                  >
                    <img src={photo} alt={`${listing.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* right: details */}
          <div className={styles.detailsSection}>
            <span className={styles.categoryBadge}>
              {listing.sub_type?.replace(/_/g, ' ')}
            </span>

            <h1 className={styles.title}>{listing.name}</h1>

            {/* basic info */}
            <div className={styles.infoGrid}>
              {listing.brand && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Brand</span>
                  <span className={styles.infoValue}>{listing.brand}</span>
                </div>
              )}
              {listing.model && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Model</span>
                  <span className={styles.infoValue}>{listing.model}</span>
                </div>
              )}
              {listing.year && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Year</span>
                  <span className={styles.infoValue}>{listing.year}</span>
                </div>
              )}
              {listing.hours_used && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Hours Used</span>
                  <span className={styles.infoValue}>{listing.hours_used}</span>
                </div>
              )}
            </div>

            <div className={styles.locationRow}>
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{listing.location_city}</span>
            </div>

            {/* pricing */}
            <div className={styles.pricing}>
              <div className={styles.priceMain}>
                <span className={styles.priceAmount}>{listing.daily_rate_omr}</span>
                <span className={styles.pricePeriod}>OMR / day</span>
              </div>
              <div className={styles.priceOptions}>
                {listing.weekly_rate_omr && (
                  <div className={styles.priceOption}>
                    <span className={styles.priceOptionLabel}>Weekly</span>
                    <span className={styles.priceOptionValue}>{listing.weekly_rate_omr} OMR</span>
                  </div>
                )}
                {listing.monthly_rate_omr && (
                  <div className={styles.priceOption}>
                    <span className={styles.priceOptionLabel}>Monthly</span>
                    <span className={styles.priceOptionValue}>{listing.monthly_rate_omr} OMR</span>
                  </div>
                )}
              </div>
            </div>

            {/* specifications */}
            {listing.additional_specs && Object.keys(listing.additional_specs).length > 0 && (
              <div className={styles.specsSection}>
                <h3 className={styles.sectionTitle}>Specifications</h3>
                <div className={styles.specsGrid}>
                  {Object.entries(listing.additional_specs).map(([key, value]) => {
                    if (value === null || value === undefined || value === '') return null;
                    return (
                      <div key={key} className={styles.specItem}>
                        <span className={styles.specLabel}>{getSpecLabel(key)}</span>
                        <span className={styles.specValue}>
                          {value} {getSpecUnit(key)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* description */}
            {listing.description && (
              <div className={styles.descriptionSection}>
                <h3 className={styles.sectionTitle}>Description</h3>
                <p className={styles.description}>{listing.description}</p>
              </div>
            )}

            {/* request button */}
            <div className={styles.requestSection}>
              <button
                onClick={() => setShowRequestForm(true)}
                className={styles.requestBtn}
              >
                Request This Item
              </button>
            </div>

            {/* seller info */}
            <div className={styles.sellerSection}>
              <h3 className={styles.sectionTitle}>About the Seller</h3>
              <div className={styles.sellerCard}>
                <div className={styles.sellerInfo}>
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <span className={styles.companyName}>{listing.company_name}</span>
                </div>
                <div className={styles.sellerInfo}>
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{listing.seller_city}</span>
                </div>
                {listing.company_phone && (
                  <div className={styles.sellerInfo}>
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{listing.company_phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.postedDate}>
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Posted on {formatDate(listing.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* request form modal */}
      {showRequestForm && listing && (
        <RequestFormModal
          listingId={listing.id}
          listingName={listing.name}
          sellerProfileId={listing.seller_profile_id}
          onClose={() => setShowRequestForm(false)}
        />
      )}
    </div>
  );
}