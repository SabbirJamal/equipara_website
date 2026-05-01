'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from './Auth.module.css';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
}

export default function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    country: 'Oman',
    city: '',
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<SignupFormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.city) {
      newErrors.city = 'City is required';
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
      // Step 1: Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      // Step 2: Create user profile using secure function
      const { error: profileError } = await supabase.rpc('create_user_profile', {
        user_id: authData.user.id,
        user_full_name: formData.fullName,
        user_phone: formData.phone,
        user_country: formData.country,
        user_city: formData.city,
      });

      if (profileError) throw profileError;

      alert('Registration successful!');
      router.push('/login');
      
    } catch (error: any) {
      alert(error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SignupFormData) => (
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
          label="Full Name"
          type="text"
          placeholder="Ahmed Al Balushi"
          value={formData.fullName}
          onChange={handleChange('fullName')}
          error={errors.fullName}
        />
      </div>

      <div className={styles.fieldGroup}>
        <Input
          label="Email Address"
          type="email"
          placeholder="ahmed@company.com"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
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
        <Input
          label="Country"
          type="text"
          value={formData.country}
          onChange={handleChange('country')}
          disabled
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.selectLabel}>City</label>
        <select
          className={styles.select}
          value={formData.city}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, city: e.target.value }));
            if (errors.city) {
              setErrors(prev => ({ ...prev, city: undefined }));
            }
          }}
        >
          <option value="">Select your city</option>
          {omanCities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        {errors.city && <span className={styles.errorMessage}>{errors.city}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange('password')}
          error={errors.password}
        />
      </div>

      <div className={styles.fieldGroup}>
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
        />
      </div>

      <div className={styles.terms}>
        <input type="checkbox" id="terms" className={styles.checkbox} />
        <label htmlFor="terms" className={styles.termsLabel}>
          I agree to the{' '}
          <a href="/terms" className={styles.link}>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className={styles.link}>
            Privacy Policy
          </a>
        </label>
      </div>

      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>

      <p className={styles.loginLink}>
        Already have an account?{' '}
        <a href="/login" className={styles.link}>
          Sign in
        </a>
      </p>
    </form>
  );
}