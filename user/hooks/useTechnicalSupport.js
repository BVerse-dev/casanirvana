import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

// Hook to submit technical support request
export const useSubmitTechnicalSupport = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submitSupport = async (supportData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert([{
          ...supportData,
          inquiry_type: 'technical_support',
          status: 'open'
        }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (err) {
      console.error('Error submitting technical support:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitSupport, isSubmitting, error };
};

// Hook to get user's technical support requests
export const useGetTechnicalSupport = (userId) => {
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupport = async () => {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .eq('user_id', userId)
          .eq('inquiry_type', 'technical_support')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSupportRequests(data || []);
      } catch (err) {
        console.error('Error fetching technical support:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSupport();
    }
  }, [userId]);

  return { supportRequests, loading, error };
};

// Hook to upload attachment to Supabase Storage
export const useUploadAttachment = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadAttachment = async (file, fileName) => {
    setIsUploading(true);
    setError(null);

    try {
      let resolvedName = fileName;
      let resolvedType;
      let uploadPayload = file;

      if (file && typeof file === 'object' && file.uri) {
        resolvedName = resolvedName || file.name || `attachment_${Date.now()}`;
        resolvedType = file.type;

        const response = await fetch(file.uri);
        uploadPayload = await response.blob();
      } else if (!resolvedName) {
        resolvedName = `attachment_${Date.now()}`;
      }

      const fileExt = (resolvedName.includes('.') ? resolvedName.split('.').pop() : 'bin') || 'bin';
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(filePath, uploadPayload, resolvedType ? { contentType: resolvedType } : undefined);

      if (error) throw error;

      // Get the public URL
      const { data: publicData } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      return { 
        success: true, 
        data: {
          path: filePath,
          publicUrl: publicData.publicUrl,
          originalName: resolvedName
        },
        url: publicData.publicUrl
      };
    } catch (err) {
      console.error('Error uploading attachment:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAttachment, isUploading, error };
};

// Hook to get support request by ID
export const useGetSupportRequest = (requestId) => {
  const [supportRequest, setSupportRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupportRequest = async () => {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .eq('id', requestId)
          .eq('inquiry_type', 'technical_support')
          .single();

        if (error) throw error;
        setSupportRequest(data);
      } catch (err) {
        console.error('Error fetching support request:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchSupportRequest();
    }
  }, [requestId]);

  return { supportRequest, loading, error };
};
