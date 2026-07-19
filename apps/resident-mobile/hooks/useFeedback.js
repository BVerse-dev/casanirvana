import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

// Hook to submit feedback
export const useSubmitFeedback = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submitFeedback = async (feedbackData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert([{
          ...feedbackData,
          inquiry_type: 'feedback',
          status: 'open'
        }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitFeedback, isSubmitting, error };
};

// Hook to get user's feedback submissions
export const useGetFeedback = (userId) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .eq('user_id', userId)
          .eq('inquiry_type', 'feedback')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFeedbacks(data || []);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchFeedbacks();
    }
  }, [userId]);

  return { feedbacks, loading, error };
};

// Hook to get feedback by ID
export const useGetFeedbackById = (feedbackId) => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .eq('id', feedbackId)
          .eq('inquiry_type', 'feedback')
          .single();

        if (error) throw error;
        setFeedback(data);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (feedbackId) {
      fetchFeedback();
    }
  }, [feedbackId]);

  return { feedback, loading, error };
};

// Hook to update feedback
export const useUpdateFeedback = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updateFeedback = async (feedbackId, updateData) => {
    setIsUpdating(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .update(updateData)
        .eq('id', feedbackId)
        .eq('inquiry_type', 'feedback')
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error updating feedback:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateFeedback, isUpdating, error };
};
