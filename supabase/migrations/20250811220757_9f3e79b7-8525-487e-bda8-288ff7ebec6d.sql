-- Drop the overly permissive policy that allows anyone to view all profiles
DROP POLICY "Users can view all profiles" ON public.profiles;

-- Create more restrictive policies for profile access
-- 1. Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Allow viewing profiles of users who have written public reviews
-- This maintains functionality for showing reviewer names in public reviews
CREATE POLICY "Users can view profiles of reviewers" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.reviews 
    WHERE reviews.user_id = profiles.user_id
  )
);