-- Allow anonymous users to create restaurants (needed for anonymous reviews)
DROP POLICY IF EXISTS "Authenticated users can create restaurants" ON public.restaurants;

CREATE POLICY "Anyone can create restaurants" 
ON public.restaurants 
FOR INSERT 
WITH CHECK (true);