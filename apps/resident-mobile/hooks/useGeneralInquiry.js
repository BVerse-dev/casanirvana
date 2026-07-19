import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

// Hook to submit general inquiry
export const useSubmitGeneralInquiry = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submitInquiry = async (inquiryData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert([{
          ...inquiryData,
          inquiry_type: 'general_inquiry',
          status: 'open'
        }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (err) {
      console.error('Error submitting general inquiry:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitInquiry,
    submitGeneralInquiry: submitInquiry,
    isSubmitting,
    error,
  };
};

// Hook to get user's general inquiries
export const useGetGeneralInquiries = (userId) => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .eq('user_id', userId)
          .eq('inquiry_type', 'general_inquiry')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInquiries(data || []);
      } catch (err) {
        console.error('Error fetching general inquiries:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchInquiries();
    }
  }, [userId]);

  return { inquiries, loading, error };
};

// Hook to get inquiry by ID
export const useGetInquiry = (inquiryId) => {
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .eq('id', inquiryId)
          .single();

        if (error) throw error;
        setInquiry(data);
      } catch (err) {
        console.error('Error fetching inquiry:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (inquiryId) {
      fetchInquiry();
    }
  }, [inquiryId]);

  return { inquiry, loading, error };
};

// Hook to update inquiry
export const useUpdateInquiry = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updateInquiry = async (inquiryId, updateData) => {
    setIsUpdating(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .update(updateData)
        .eq('id', inquiryId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error updating inquiry:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateInquiry, isUpdating, error };
};
