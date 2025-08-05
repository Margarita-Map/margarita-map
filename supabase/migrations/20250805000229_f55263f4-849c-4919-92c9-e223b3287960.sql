-- Create tequila brands table
CREATE TABLE public.tequila_brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  user_submitted BOOLEAN NOT NULL DEFAULT false,
  submitted_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create brand votes table
CREATE TABLE public.brand_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID NOT NULL REFERENCES public.tequila_brands(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, brand_id)
);

-- Enable RLS
ALTER TABLE public.tequila_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_votes ENABLE ROW LEVEL SECURITY;

-- Policies for tequila_brands
CREATE POLICY "Anyone can view tequila brands" 
ON public.tequila_brands 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can add brands" 
ON public.tequila_brands 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Policies for brand_votes
CREATE POLICY "Anyone can view brand votes" 
ON public.brand_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can vote for brands" 
ON public.brand_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their votes" 
ON public.brand_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_tequila_brands_updated_at
BEFORE UPDATE ON public.tequila_brands
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert top 10 popular tequila brands
INSERT INTO public.tequila_brands (name, description, user_submitted) VALUES
('Jose Cuervo', 'World''s best-selling tequila brand', false),
('Patrón', 'Premium ultra-smooth tequila', false),
('Don Julio', 'Luxury tequila with rich heritage', false),
('Herradura', 'Traditional tequila since 1870', false),
('Espolòn', 'Premium 100% agave tequila', false),
('Casamigos', 'Ultra-premium tequila co-founded by George Clooney', false),
('Hornitos', 'Bold, smooth tequila for mixing', false),
('1800 Tequila', 'Premium tequila aged to perfection', false),
('Sauza', 'Mexico''s original exported tequila', false),
('Avión', 'Ultra-premium tequila crafted in Jalisco', false);