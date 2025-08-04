-- Create table for drink specials
CREATE TABLE public.drink_specials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  drink_name TEXT NOT NULL,
  description TEXT,
  special_price NUMERIC(10,2),
  regular_price NUMERIC(10,2),
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'daily')),
  start_time TIME,
  end_time TIME,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.drink_specials ENABLE ROW LEVEL SECURITY;

-- Create policies for drink specials
CREATE POLICY "Anyone can view active drink specials" 
ON public.drink_specials 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create drink specials" 
ON public.drink_specials 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update drink specials they created" 
ON public.drink_specials 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete drink specials they created" 
ON public.drink_specials 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_drink_specials_updated_at
BEFORE UPDATE ON public.drink_specials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_drink_specials_restaurant_id ON public.drink_specials(restaurant_id);
CREATE INDEX idx_drink_specials_day_of_week ON public.drink_specials(day_of_week);
CREATE INDEX idx_drink_specials_active ON public.drink_specials(is_active);