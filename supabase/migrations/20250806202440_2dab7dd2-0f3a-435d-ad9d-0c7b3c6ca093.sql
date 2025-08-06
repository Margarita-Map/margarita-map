-- Create party check-ins table
CREATE TABLE public.party_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL,
  user_id UUID,
  guest_name TEXT,
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.party_checkins ENABLE ROW LEVEL SECURITY;

-- Create policies for party check-ins
CREATE POLICY "Anyone can view party check-ins" 
ON public.party_checkins 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can check in to parties" 
ON public.party_checkins 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own check-ins" 
ON public.party_checkins 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own check-ins" 
ON public.party_checkins 
FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Add foreign key reference to party_posts
ALTER TABLE public.party_checkins 
ADD CONSTRAINT party_checkins_party_id_fkey 
FOREIGN KEY (party_id) REFERENCES public.party_posts(id) ON DELETE CASCADE;