import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

// Hook to submit suggestions
export const useSubmitSuggestion = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submitSuggestion = async (suggestionData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert([{
          ...suggestionData,
          inquiry_type: 'suggestion',
          status: 'open'
        }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (err) {
      console.error('Error submitting suggestion:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitSuggestion, isSubmitting, error };
};

// Hook to get user's suggestions
export const useGetSuggestions = (userId) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .eq('user_id', userId)
          .eq('inquiry_type', 'suggestion')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSuggestions(data || []);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSuggestions();
    }
  }, [userId]);

  return { suggestions, loading, error };
};

// Hook to get suggestion by ID
export const useGetSuggestionById = (suggestionId) => {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestion = async () => {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .eq('id', suggestionId)
          .eq('inquiry_type', 'suggestion')
          .single();

        if (error) throw error;
        setSuggestion(data);
      } catch (err) {
        console.error('Error fetching suggestion:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (suggestionId) {
      fetchSuggestion();
    }
  }, [suggestionId]);

  return { suggestion, loading, error };
};

// Hook to update suggestion
export const useUpdateSuggestion = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updateSuggestion = async (suggestionId, updateData) => {
    setIsUpdating(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .update(updateData)
        .eq('id', suggestionId)
        .eq('inquiry_type', 'suggestion')
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error updating suggestion:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateSuggestion, isUpdating, error };
};
