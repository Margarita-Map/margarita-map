-- Create table for party photos
CREATE TABLE public.party_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  photo_url TEXT NOT NULL,
  caption TEXT,
  location_name TEXT NOT NULL,
  location_address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.party_photos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view party photos" 
ON public.party_photos 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can upload party photos" 
ON public.party_photos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own party photos" 
ON public.party_photos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own party photos" 
ON public.party_photos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_party_photos_updated_at
BEFORE UPDATE ON public.party_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();