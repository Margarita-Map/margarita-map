-- Make user_id nullable in brand_votes for anonymous voting
ALTER TABLE public.brand_votes ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view brand votes" ON public.brand_votes;
DROP POLICY IF EXISTS "Users can vote for brands" ON public.brand_votes;
DROP POLICY IF EXISTS "Users can update their votes" ON public.brand_votes;
DROP POLICY IF EXISTS "Anyone can vote for brands" ON public.brand_votes;
DROP POLICY IF EXISTS "Anyone can delete votes" ON public.brand_votes;

-- New policies for anonymous voting
CREATE POLICY "Public can view brand votes" 
ON public.brand_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Public can vote for brands" 
ON public.brand_votes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can delete votes"
ON public.brand_votes 
FOR DELETE 
USING (true);