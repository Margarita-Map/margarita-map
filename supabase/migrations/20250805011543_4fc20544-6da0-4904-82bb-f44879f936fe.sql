-- Create table for tequila tasting events
CREATE TABLE public.tequila_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  contact_info TEXT,
  website TEXT,
  price TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tequila_events ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Anyone can view tequila events" 
ON public.tequila_events 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create tequila events" 
ON public.tequila_events 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tequila_events_updated_at
BEFORE UPDATE ON public.tequila_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();