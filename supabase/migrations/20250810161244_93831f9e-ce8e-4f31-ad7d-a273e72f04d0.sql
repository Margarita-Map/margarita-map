-- Add foreign key relationship between party_photos and profiles
ALTER TABLE public.party_photos 
ADD CONSTRAINT party_photos_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);