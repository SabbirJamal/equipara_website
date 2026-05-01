'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FavoriteButtonProps {
  listingId: string;
  size?: 'sm' | 'md';
}

export default function FavoriteButton({ listingId, size = 'md' }: FavoriteButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, listingId]);

  const checkFavoriteStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase.rpc('is_favourited', {
      p_user_id: user.id,
      p_listing_id: listingId,
    });
    
    setIsFavorited(data || false);
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent card link navigation
    e.stopPropagation();
    
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase.rpc('toggle_favourite', {
      p_user_id: user.id,
      p_listing_id: listingId,
    });

    if (!error) {
      setIsFavorited(data || false);
    }
    
    setLoading(false);
  };

  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`${sizeClass} rounded-full flex items-center justify-center transition-all ${
        isFavorited 
          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
          : 'bg-black/30 text-white hover:bg-black/50'
      }`}
    >
      <Heart 
        className={`${iconSize} ${isFavorited ? 'fill-current' : ''}`} 
      />
    </button>
  );
}