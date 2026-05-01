'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from './Auth.module.css';

interface SellerFormData {
  companyName: string;
  crNumber: string;
  phone: string;
  locationCity: string;
}

export default function BecomeSellerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<SellerFormData>>({});
  const [formData, setFormData] = useState<SellerFormData>({
    companyName: '',
    crNumber: '',
    phone: '',
    locationCity: '',
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<SellerFormData> = {};

    if (!formData.companyName) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.crNumber) {
      newErrors.crNumber = 'CR number is required';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.locationCity) {
      newErrors.locationCity = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        router.push('/login');
        return;
      }

      // For now, use a placeholder CR document URL (we'll add file upload later)
      const crDocumentUrl = 'pending_upload';

      // Call the register_as_seller function
      const { error: sellerError } = await supabase.rpc('register_as_seller', {
        p_user_id: user.id,
        p_company_name: formData.companyName,
        p_cr_number: formData.crNumber,
        p_cr_document_url: crDocumentUrl,
        p_phone: formData.phone,
        p_location_city: formData.locationCity,
      });

      if (sellerError) throw sellerError;

      alert('You are now registered as a seller!');
      router.push('/add-listing');
      
    } catch (error: any) {
      alert(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SellerFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const omanCities = [
    'Muscat', 'Sohar', 'Salalah', 'Nizwa', 'Sur', 
    'Buraimi', 'Ibri', 'Rustaq', 'Barka', 'Khasab'
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.fieldGroup}>
        <Input
          label="Company Name"
          type="text"
          placeholder="Al Balushi Trading LLC"
          value={formData.companyName}
          onChange={handleChange('companyName')}
          error={errors.companyName}
        />
      </div>

      <div className={styles.fieldGroup}>
        <Input
          label="CR Number (Commercial Registration)"
          type="text"
          placeholder="1234567"
          value={formData.crNumber}
          onChange={handleChange('crNumber')}
          error={errors.crNumber}
        />
      </div>

      <div className={styles.fieldGroup}>
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+968 1234 5678"
          value={formData.phone}
          onChange={handleChange('phone')}
          error={errors.phone}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.selectLabel}>Location City</label>
        <select
          className={styles.select}
          value={formData.locationCity}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, locationCity: e.target.value }));
            if (errors.locationCity) {
              setErrors(prev => ({ ...prev, locationCity: undefined }));
            }
          }}
        >
          <option value="">Select your city</option>
          {omanCities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        {errors.locationCity && <span className={styles.errorMessage}>{errors.locationCity}</span>}
      </div>

      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading ? 'Registering...' : 'Register as Seller'}
      </Button>
    </form>
  );
}