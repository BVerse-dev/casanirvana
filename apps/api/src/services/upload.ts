import { supabase } from '../lib/supabase';
import crypto from 'crypto';
import path from 'path';

export async function uploadFile(file: Express.Multer.File, bucket: string = process.env.UPLOAD_BUCKET || 'uploads') {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const fileName = `${crypto.randomUUID()}${ext}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) throw error;
  
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return {
    $id: data.path,
    path: data.path,
    name: fileName,
    publicUrl: publicUrlData.publicUrl
  };
}
