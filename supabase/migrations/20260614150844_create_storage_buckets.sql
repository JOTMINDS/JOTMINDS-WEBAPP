-- Create the "audio-responses" bucket for Kids tier
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-responses', 'audio-responses', false)
ON CONFLICT (id) DO NOTHING;

-- Create the "avatars" bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS) for "avatars" bucket

-- Avatar images are publicly accessible
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Users can upload their own avatar (filename is exactly {userId}.png or similar)
CREATE POLICY "Users can upload their own avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.uid()::text = SPLIT_PART(name, '.', 1) );

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' AND auth.uid()::text = SPLIT_PART(name, '.', 1) );

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar."
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'avatars' AND auth.uid()::text = SPLIT_PART(name, '.', 1) );


-- Set up Row Level Security (RLS) for "audio-responses" bucket

-- Users can view their own audio responses (path is {userId}/{qid}.m4a)
CREATE POLICY "Users can view their own audio responses."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'audio-responses' AND auth.uid()::text = SPLIT_PART(name, '/', 1) );

-- Users can upload their own audio responses
CREATE POLICY "Users can upload their own audio responses."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'audio-responses' AND auth.uid()::text = SPLIT_PART(name, '/', 1) );

-- Users can update their own audio responses
CREATE POLICY "Users can update their own audio responses."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'audio-responses' AND auth.uid()::text = SPLIT_PART(name, '/', 1) );

-- Users can delete their own audio responses
CREATE POLICY "Users can delete their own audio responses."
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'audio-responses' AND auth.uid()::text = SPLIT_PART(name, '/', 1) );
