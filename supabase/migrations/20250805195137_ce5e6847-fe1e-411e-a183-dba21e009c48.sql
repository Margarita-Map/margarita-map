-- Make user_id nullable to allow anonymous reviews
ALTER TABLE public.reviews ALTER COLUMN user_id DROP NOT NULL;

-- Drop all existing policies on reviews table
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anonymous users can create reviews" ON public.reviews;

-- Create new policies that allow both authenticated and anonymous access
CREATE POLICY "Public can view all reviews" 
ON public.reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create their own reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can create reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (user_id IS NULL);

CREATE POLICY "Authenticated users can update their own reviews" 
ON public.reviews 
FOR UPDATE 
USING (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "Authenticated users can delete their own reviews" 
ON public.reviews 
FOR DELETE 
USING (auth.uid() = user_id AND user_id IS NOT NULL);