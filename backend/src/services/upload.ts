import { supabase } from '../lib/supabase';

export async function uploadFile(file: Express.Multer.File, bucket: string = 'uploads') {
  const fileName = `${Date.now()}-${file.originalname}`;
  
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
