'use client';

import { useState } from 'react';
import { X, Calendar, MapPin, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import styles from './RequestFormModal.module.css';

interface RequestFormModalProps {
  listingId: string;
  listingName: string;
  sellerProfileId: string;
  onClose: () => void;
}

export default function RequestFormModal({ listingId, listingName, sellerProfileId, onClose }: RequestFormModalProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    deliveryLocation: '',
    notes: '',
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || !formData.pickupLocation || !formData.deliveryLocation) {
      alert('Please fill all required fields');
      return;
    }

    if (!user || !profile) {
      alert('Please login to make a request');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.rpc('create_booking_request', {
        p_buyer_id: user.id,
        p_listing_id: listingId,
        p_seller_profile_id: sellerProfileId,
        p_start_date: formData.startDate,
        p_end_date: formData.endDate,
        p_pickup_location: formData.pickupLocation,
        p_delivery_location: formData.deliveryLocation,
        p_notes: formData.notes || null,
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (error: any) {
      alert(error.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Request This Item</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h3>Request Sent!</h3>
            <p>The seller will review your request and respond soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* item name */}
            <div className={styles.itemName}>
              <FileText className="w-4 h-4" />
              <span>{listingName}</span>
            </div>

            <div className={styles.formGrid}>
              {/* start date */}
              <div className={styles.field}>
                <label className={styles.label}>
                  <Calendar className="w-4 h-4" />
                  Start Date *
                </label>
                <input
                  type="date"
                  className={styles.input}
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* end date */}
              <div className={styles.field}>
                <label className={styles.label}>
                  <Calendar className="w-4 h-4" />
                  End Date *
                </label>
                <input
                  type="date"
                  className={styles.input}
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* pickup location */}
              <div className={styles.field}>
                <label className={styles.label}>
                  <MapPin className="w-4 h-4" />
                  Pickup Location *
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., Sohar Industrial Area"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                />
              </div>

              {/* delivery location */}
              <div className={styles.field}>
                <label className={styles.label}>
                  <MapPin className="w-4 h-4" />
                  Delivery Location *
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., Muscat, Al Khuwair"
                  value={formData.deliveryLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryLocation: e.target.value }))}
                />
              </div>
            </div>

            {/* notes */}
            <div className={styles.field}>
              <label className={styles.label}>Notes</label>
              <textarea
                className={styles.textarea}
                rows={3}
                placeholder="Any special requirements..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}