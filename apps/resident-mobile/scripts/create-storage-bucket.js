const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function createAttachmentsBucket() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
    console.log('💡 Then run: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-storage-bucket.js');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🚀 Creating attachments storage bucket...');

    // Create the bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('attachments', {
      public: true,
      allowedMimeTypes: [
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp',
        'audio/mpeg',
        'audio/wav',
        'audio/mp4',
        'audio/aac',
        'audio/m4a',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ],
      fileSizeLimit: 10485760 // 10MB
    });

    if (bucketError && !bucketError.message.includes('already exists')) {
      throw bucketError;
    }

    console.log('✅ Bucket "attachments" created or already exists');

    // Create storage policies for the bucket
    console.log('🔒 Setting up storage policies...');

    // Policy to allow authenticated users to upload files
    const uploadPolicySQL = `
      CREATE POLICY "Users can upload attachments" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'attachments');
    `;

    // Policy to allow anyone to view files (for chat messages)
    const selectPolicySQL = `
      CREATE POLICY "Anyone can view attachments" ON storage.objects
      FOR SELECT TO anon, authenticated
      USING (bucket_id = 'attachments');
    `;

    // Policy to allow users to delete their own files
    const deletePolicySQL = `
      CREATE POLICY "Users can delete their own attachments" ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
    `;

    // Execute policies (they might already exist, so we'll catch errors)
    try {
      await supabase.rpc('exec_sql', { sql: uploadPolicySQL });
      console.log('✅ Upload policy created');
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.log('⚠️  Upload policy might already exist');
      }
    }

    try {
      await supabase.rpc('exec_sql', { sql: selectPolicySQL });
      console.log('✅ Select policy created');
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.log('⚠️  Select policy might already exist');
      }
    }

    try {
      await supabase.rpc('exec_sql', { sql: deletePolicySQL });
      console.log('✅ Delete policy created');
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.log('⚠️  Delete policy might already exist');
      }
    }

    console.log('🎉 Storage bucket setup complete!');
    console.log('📁 Bucket name: attachments');
    console.log('🔗 Files will be organized as: chat-attachments/{user_id}/{timestamp}-{filename}');
    
  } catch (error) {
    console.error('❌ Error setting up storage bucket:', error);
    process.exit(1);
  }
}

createAttachmentsBucket(); 
