-- Create party_posts table for social party sharing
CREATE TABLE public.party_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  party_date DATE NOT NULL,
  party_time TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.party_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for party posts
CREATE POLICY "Anyone can view party posts" 
ON public.party_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own party posts" 
ON public.party_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own party posts" 
ON public.party_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own party posts" 
ON public.party_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_party_posts_updated_at
BEFORE UPDATE ON public.party_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();