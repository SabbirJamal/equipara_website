'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { equipmentTypes, specOptions, specToColumnMap, SpecOption } from '@/lib/equipment-types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './page.module.css';
import SmartHeader from '@/components/layout/SmartHeader';

interface SpecValue {
  key: string;
  value: string;
}

export default function AddListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sellerProfileId, setSellerProfileId] = useState<string>('');

  // Step 1: Type selection
  const [category, setCategory] = useState<'equipment' | 'transport' | ''>('');
  const [subType, setSubType] = useState('');

  // Step 2: Specifications
  const [specs, setSpecs] = useState<SpecValue[]>([]);

  // Step 3: Details
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [weeklyRate, setWeeklyRate] = useState('');
  const [monthlyRate, setMonthlyRate] = useState('');
  const [hoursUsed, setHoursUsed] = useState('');
  const [description, setDescription] = useState('');

  // Photo upload
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Get seller profile on load
  useEffect(() => {
    const loadSellerProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase.rpc('get_user_profile', {
        user_id: user.id,
      });

      if (!profile || !profile[0]?.is_seller) {
        alert('You must be a registered seller');
        router.push('/become-seller');
        return;
      }

      // Get seller profile ID
      const { data: sellerProfiles } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (sellerProfiles) {
        setSellerProfileId(sellerProfiles.id);
      }
    };

    loadSellerProfile();
  }, [router]);

  const handleCategorySelect = (cat: 'equipment' | 'transport') => {
    setCategory(cat);
    setSubType('');
  };

  const handleSubTypeSelect = (sub: string) => {
    setSubType(sub);
    // Initialize specs for selected type
    const options = specOptions[sub] || [];
    setSpecs(options.map(opt => ({ key: opt.key, value: '' })));
  };

  const handleSpecChange = (key: string, value: string) => {
    setSpecs(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    
    setPhotos(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setPhotoPreviewUrls(prev => [...prev, url]);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadPhotos = async (): Promise<string[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const uploadedUrls: string[] = [];

    for (const photo of photos) {
      const fileName = `${user.id}/${Date.now()}-${photo.name}`;
      const { data, error } = await supabase.storage
        .from('listing-photos')
        .upload(fileName, photo);

      if (error) {
        console.error('Upload error:', error);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('listing-photos')
        .getPublicUrl(data.path);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!category || !subType) {
        alert('Please select a category and type');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!name || !locationCity || !dailyRate) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setUploadingPhotos(true);

    try {
      // Upload photos first
      const photoUrls = await uploadPhotos();

      // Build list of all spec values
      const specValues: Record<string, any> = {};
      specs.forEach(s => {
        if (s.value) {
          specValues[s.key] = specOptions[subType]?.find(o => o.key === s.key)?.type === 'number' 
            ? parseFloat(s.value) 
            : s.value;
        }
      });

      // Extract searchable specs
      const searchableSpecs: Record<string, any> = {};
      Object.entries(specToColumnMap).forEach(([specKey, columnKey]) => {
        if (specValues[specKey] !== undefined) {
          searchableSpecs[columnKey] = specValues[specKey];
        }
      });

      await supabase.rpc('create_fleet_listing', {
        p_seller_profile_id: sellerProfileId,
        p_category: category,
        p_sub_type: subType,
        p_name: name,
        p_brand: brand || null,
        p_model: model || null,
        p_year: year ? parseInt(year) : null,
        p_location_city: locationCity,
        p_daily_rate_omr: parseFloat(dailyRate),
        p_weekly_rate_omr: weeklyRate ? parseFloat(weeklyRate) : null,
        p_monthly_rate_omr: monthlyRate ? parseFloat(monthlyRate) : null,
        p_hours_used: hoursUsed ? parseInt(hoursUsed) : null,
        p_photos: photoUrls,
        p_description: description || null,
        p_lift_capacity_tons: searchableSpecs.lift_capacity_tons || null,
        p_boom_length_meters: searchableSpecs.boom_length_meters || null,
        p_deck_length_ft: searchableSpecs.deck_length_ft || null,
        p_load_capacity_tons: searchableSpecs.load_capacity_tons || null,
        p_max_height_meters: searchableSpecs.max_height_meters || null,
        p_axle_count: searchableSpecs.axle_count ? parseInt(searchableSpecs.axle_count) : null,
        p_additional_specs: specValues,
      });

      alert('Listing added successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Failed to add listing');
    } finally {
      setLoading(false);
      setUploadingPhotos(false);
    }
  };

  const getCurrentSpecs = () => specOptions[subType] || [];

  const omanCities = ['Muscat', 'Sohar', 'Salalah', 'Nizwa', 'Sur', 'Buraimi', 'Ibri', 'Rustaq', 'Barka', 'Khasab'];

  return (
    <div className={styles.container}>
      <div className={styles.pageWrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Add New Listing</h1>
          <div className={styles.steps}>
            <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>1</div>
            <div className={styles.stepLine}></div>
            <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>2</div>
            <div className={styles.stepLine}></div>
            <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>3</div>
          </div>
        </div>

        <div className={styles.formCard}>
          {/* Step 1: Choose Category & Type */}
          {step === 1 && (
            <div>
              <h2 className={styles.stepTitle}>Select Equipment Type</h2>
              
              <div className={styles.categoryButtons}>
                <button
                  className={`${styles.categoryBtn} ${category === 'equipment' ? styles.categoryActive : ''}`}
                  onClick={() => handleCategorySelect('equipment')}
                >
                  🏗️ Equipment
                </button>
                <button
                  className={`${styles.categoryBtn} ${category === 'transport' ? styles.categoryActive : ''}`}
                  onClick={() => handleCategorySelect('transport')}
                >
                  🚛 Transport
                </button>
              </div>

              {category && (
                <div className={styles.typeGrid}>
                  {equipmentTypes
                    .filter(t => t.category === category)
                    .map(type => (
                      <button
                        key={type.value}
                        className={`${styles.typeBtn} ${subType === type.value ? styles.typeActive : ''}`}
                        onClick={() => handleSubTypeSelect(type.value)}
                      >
                        {type.label}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Specifications */}
          {step === 2 && (
            <div>
              <h2 className={styles.stepTitle}>Specifications - {subType.replace('_', ' ')}</h2>
              
              <div className={styles.specsGrid}>
                {getCurrentSpecs().map((spec: SpecOption) => (
                  <div key={spec.key} className={styles.specField}>
                    <label className={styles.specLabel}>
                      {spec.label} {spec.unit && `(${spec.unit})`}
                    </label>
                    <input
                      type={spec.type === 'number' ? 'number' : 'text'}
                      className={styles.specInput}
                      placeholder={`Enter ${spec.label.toLowerCase()}`}
                      value={specs.find(s => s.key === spec.key)?.value || ''}
                      onChange={(e) => handleSpecChange(spec.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Details & Pricing */}
          {step === 3 && (
            <div>
              <h2 className={styles.stepTitle}>Listing Details</h2>
              
              <div className={styles.detailsGrid}>
                <Input label="Listing Name *" type="text" placeholder="75T Mobile Crane" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Brand" type="text" placeholder="Liebherr" value={brand} onChange={(e) => setBrand(e.target.value)} />
                <Input label="Model" type="text" placeholder="LTM 1070" value={model} onChange={(e) => setModel(e.target.value)} />
                <Input label="Year" type="number" placeholder="2020" value={year} onChange={(e) => setYear(e.target.value)} />
                
                <div>
                  <label className={styles.selectLabel}>Location City *</label>
                  <select className={styles.select} value={locationCity} onChange={(e) => setLocationCity(e.target.value)}>
                    <option value="">Select city</option>
                    {omanCities.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>

                <Input label="Daily Rate (OMR) *" type="number" placeholder="350" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} />
                <Input label="Weekly Rate (OMR)" type="number" placeholder="2000" value={weeklyRate} onChange={(e) => setWeeklyRate(e.target.value)} />
                <Input label="Monthly Rate (OMR)" type="number" placeholder="7500" value={monthlyRate} onChange={(e) => setMonthlyRate(e.target.value)} />
                <Input label="Hours Used" type="number" placeholder="1200" value={hoursUsed} onChange={(e) => setHoursUsed(e.target.value)} />

                {/* Photo Upload */}
                <div className={styles.fullWidth}>
                  <label className={styles.selectLabel}>Photos (max 5)</label>
                  <div className={styles.photoUpload}>
                    <div className={styles.photoGrid}>
                      {photoPreviewUrls.map((url, index) => (
                        <div key={index} className={styles.photoPreview}>
                          <img src={url} alt={`Preview ${index + 1}`} className={styles.photoImg} />
                          <button
                            type="button"
                            className={styles.removePhoto}
                            onClick={() => handleRemovePhoto(index)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {photos.length < 5 && (
                        <button
                          type="button"
                          className={styles.addPhotoBtn}
                          onClick={() => photoInputRef.current?.click()}
                        >
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                          <span className={styles.addPhotoText}>Add Photo</span>
                        </button>
                      )}
                    </div>
                    
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoSelect}
                      className={styles.hiddenInput}
                    />
                  </div>
                </div>
                
                <div className={styles.fullWidth}>
                  <label className={styles.selectLabel}>Description</label>
                  <textarea className={styles.textarea} rows={4} placeholder="Describe your equipment..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className={styles.navigation}>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button variant="primary" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                {loading ? (uploadingPhotos ? 'Uploading Photos...' : 'Submitting...') : 'Submit Listing'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}