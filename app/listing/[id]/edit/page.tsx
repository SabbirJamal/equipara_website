'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { specOptions, specToColumnMap, SpecOption } from '@/lib/equipment-types';
import SmartHeader from '@/components/layout/SmartHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './page.module.css';

interface SpecValue {
  key: string;
  value: string;
}

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [subType, setSubType] = useState('');
  const [specs, setSpecs] = useState<SpecValue[]>([]);
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

  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPhotoPreviewUrls, setNewPhotoPreviewUrls] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    console.log('loading listing:', id);
    
    const { data, error } = await supabase.rpc('get_listing_for_edit', {
      p_listing_id: id,
    });

    console.log('data:', data, 'error:', error);

    if (!error && data && data.length > 0) {
      const listing = data[0];
      setSubType(listing.sub_type);
      setName(listing.name);
      setBrand(listing.brand || '');
      setModel(listing.model || '');
      setYear(listing.year?.toString() || '');
      setLocationCity(listing.location_city);
      setDailyRate(listing.daily_rate_omr?.toString() || '');
      setWeeklyRate(listing.weekly_rate_omr?.toString() || '');
      setMonthlyRate(listing.monthly_rate_omr?.toString() || '');
      setHoursUsed(listing.hours_used?.toString() || '');
      setDescription(listing.description || '');
      setExistingPhotos(listing.photos || []);

      if (listing.additional_specs) {
        const specEntries = Object.entries(listing.additional_specs).map(([key, value]) => ({
          key,
          value: value?.toString() || '',
        }));
        setSpecs(specEntries);
      }
    }
    setLoading(false);
  };

  const handleSpecChange = (key: string, value: string) => {
    setSpecs(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleRemoveExistingPhoto = (index: number) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + newPhotos.length + existingPhotos.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    setNewPhotos(prev => [...prev, ...files]);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setNewPhotoPreviewUrls(prev => [...prev, url]);
    });
  };

  const handleRemoveNewPhoto = (index: number) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
    setNewPhotoPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadNewPhotos = async (): Promise<string[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const uploadedUrls: string[] = [];
    for (const photo of newPhotos) {
      const fileName = `${user.id}/${Date.now()}-${photo.name}`;
      const { data, error } = await supabase.storage
        .from('listing-photos')
        .upload(fileName, photo);
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(data.path);
        uploadedUrls.push(publicUrl);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!name || !locationCity || !dailyRate) {
      alert('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const newPhotoUrls = await uploadNewPhotos();
      const allPhotos = [...existingPhotos, ...newPhotoUrls];

      const specValues: Record<string, any> = {};
      specs.forEach(s => {
        if (s.value) {
          specValues[s.key] = specOptions[subType]?.find(o => o.key === s.key)?.type === 'number'
            ? parseFloat(s.value) : s.value;
        }
      });

      const searchableSpecs: Record<string, any> = {};
      Object.entries(specToColumnMap).forEach(([specKey, columnKey]) => {
        if (specValues[specKey] !== undefined) {
          searchableSpecs[columnKey] = specValues[specKey];
        }
      });

      const { error } = await supabase.rpc('update_fleet_listing', {
        p_listing_id: id,
        p_category: ['crane','forklift','excavator','loader','reach_stacker','generator','boom_lift','manlift'].includes(subType) ? 'equipment' : 'transport',
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
        p_photos: allPhotos,
        p_description: description || null,
        p_lift_capacity_tons: searchableSpecs.lift_capacity_tons || null,
        p_boom_length_meters: searchableSpecs.boom_length_meters || null,
        p_deck_length_ft: searchableSpecs.deck_length_ft || null,
        p_load_capacity_tons: searchableSpecs.load_capacity_tons || null,
        p_max_height_meters: searchableSpecs.max_height_meters || null,
        p_axle_count: searchableSpecs.axle_count ? parseInt(searchableSpecs.axle_count) : null,
        p_additional_specs: specValues,
      });

      if (error) throw error;
      alert('Listing updated successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentSpecs = () => specOptions[subType] || [];
  const omanCities = ['Muscat','Sohar','Salalah','Nizwa','Sur','Buraimi','Ibri','Rustaq','Barka','Khasab'];

  if (loading) {
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
      <div className={styles.container}>
        <h1 className={styles.title}>Edit Listing</h1>
        
        <div className={styles.formCard}>
          {/* specifications */}
          <h2 className={styles.stepTitle}>Specifications - {subType?.replace(/_/g, ' ')}</h2>
          <div className={styles.specsGrid}>
            {getCurrentSpecs().map((spec: SpecOption) => (
              <div key={spec.key} className={styles.specField}>
                <label className={styles.specLabel}>{spec.label} {spec.unit && `(${spec.unit})`}</label>
                <input
                  type={spec.type === 'number' ? 'number' : 'text'}
                  className={styles.specInput}
                  value={specs.find(s => s.key === spec.key)?.value || ''}
                  onChange={(e) => handleSpecChange(spec.key, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* details */}
          <h2 className={styles.stepTitle} style={{marginTop: '2rem'}}>Listing Details</h2>
          <div className={styles.detailsGrid}>
            <Input label="Listing Name *" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Brand" type="text" value={brand} onChange={(e) => setBrand(e.target.value)} />
            <Input label="Model" type="text" value={model} onChange={(e) => setModel(e.target.value)} />
            <Input label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
            
            <div>
              <label className={styles.selectLabel}>Location City *</label>
              <select className={styles.select} value={locationCity} onChange={(e) => setLocationCity(e.target.value)}>
                <option value="">Select city</option>
                {omanCities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

            <Input label="Daily Rate (OMR) *" type="number" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} />
            <Input label="Weekly Rate (OMR)" type="number" value={weeklyRate} onChange={(e) => setWeeklyRate(e.target.value)} />
            <Input label="Monthly Rate (OMR)" type="number" value={monthlyRate} onChange={(e) => setMonthlyRate(e.target.value)} />
            <Input label="Hours Used" type="number" value={hoursUsed} onChange={(e) => setHoursUsed(e.target.value)} />

            {/* photos */}
            <div className={styles.fullWidth}>
              <label className={styles.selectLabel}>Photos</label>
              <div className={styles.photoGrid}>
                {existingPhotos.map((url, index) => (
                  <div key={`existing-${index}`} className={styles.photoPreview}>
                    <img src={url} alt="" className={styles.photoImg} />
                    <button type="button" className={styles.removePhoto} onClick={() => handleRemoveExistingPhoto(index)}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {newPhotoPreviewUrls.map((url, index) => (
                  <div key={`new-${index}`} className={styles.photoPreview}>
                    <img src={url} alt="" className={styles.photoImg} />
                    <button type="button" className={styles.removePhoto} onClick={() => handleRemoveNewPhoto(index)}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {existingPhotos.length + newPhotos.length < 5 && (
                  <button type="button" className={styles.addPhotoBtn} onClick={() => photoInputRef.current?.click()}>
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                    <span className={styles.addPhotoText}>Add Photo</span>
                  </button>
                )}
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={handleNewPhotoSelect} className={styles.hiddenInput} />
            </div>

            <div className={styles.fullWidth}>
              <label className={styles.selectLabel}>Description</label>
              <textarea className={styles.textarea} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          {/* buttons */}
          <div className={styles.navigation}>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}