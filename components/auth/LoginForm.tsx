'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from './Auth.module.css';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        console.log('login success, waiting for session...');
        
        // wait briefly for session to be established
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // check session is active
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('session active, redirecting...');
          window.location.href = '/';
        } else {
          console.log('no session yet, trying again...');
          // try one more time
          await new Promise(resolve => setTimeout(resolve, 1000));
          window.location.href = '/dashboard';
        }
      }
      
    } catch (error: any) {
      console.error('login error:', error);
      alert(error.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  const handleChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
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
          label="Password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange('password')}
          error={errors.password}
        />
      </div>

      <div className={styles.forgotPassword}>
        <a href="/forgot-password" className={styles.link}>
          Forgot password?
        </a>
      </div>

      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>

      <p className={styles.signupLink}>
        Don't have an account?{' '}
        <a href="/signup" className={styles.link}>
          Create account
        </a>
      </p>
    </form>
  );
}