-- Create storage bucket for review photos
INSERT INTO storage.buckets (id, name, public) VALUES ('review-photos', 'review-photos', true);

-- Create storage policies for review photos
CREATE POLICY "Anyone can view review photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'review-photos');

CREATE POLICY "Authenticated users can upload review photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'review-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anonymous users can upload review photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'review-photos');

CREATE POLICY "Users can update their own review photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'review-photos');

CREATE POLICY "Users can delete their own review photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'review-photos');

-- Add photo_urls column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[];