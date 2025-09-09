import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';

/**
 * Uploads an image to Supabase storage and returns the public URL
 * @param {string} imageUri - Local file URI of the image
 * @param {string} bucketName - Name of the storage bucket
 * @param {string} fileName - Desired filename for the upload
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export const uploadImageToSupabase = async (imageUri, bucketName = 'complaint-images', fileName = null) => {
  try {
    if (!imageUri) {
      throw new Error('Image URI is required');
    }

    console.log('Starting image upload...', imageUri);

    // Generate a unique filename if not provided
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const uniqueFileName = fileName || `complaint_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('File read as base64, length:', base64.length);

    // Convert base64 to array buffer for Supabase
    const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    
    // Determine content type based on file extension
    let contentType = 'image/jpeg'; // default
    if (fileExtension) {
      switch (fileExtension.toLowerCase()) {
        case 'png':
          contentType = 'image/png';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        case 'heic':
          contentType = 'image/heic';
          break;
        default:
          contentType = 'image/jpeg';
      }
    }

    console.log('Uploading to Supabase storage...', uniqueFileName, contentType);

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, byteArray, {
        contentType: contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    console.log('Upload successful:', data);

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    console.log('Public URL generated:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;

  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Deletes an image from Supabase storage
 * @param {string} imagePath - Path/filename of the image in storage
 * @param {string} bucketName - Name of the storage bucket
 * @returns {Promise<boolean>} - Success status
 */
export const deleteImageFromSupabase = async (imagePath, bucketName = 'complaint-images') => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([imagePath]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
