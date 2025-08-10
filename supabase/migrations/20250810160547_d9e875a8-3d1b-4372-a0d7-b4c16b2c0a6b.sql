-- Add policy to allow anonymous uploads to party photos
CREATE POLICY "Anonymous users can upload party photos" 
ON public.party_photos 
FOR INSERT 
WITH CHECK (user_id IS NULL);