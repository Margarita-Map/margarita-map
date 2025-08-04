-- Update the restaurants table to include owner information
ALTER TABLE public.restaurants ADD COLUMN owner_id UUID REFERENCES auth.users(id);

-- Update drink_specials policies to check ownership
DROP POLICY IF EXISTS "Users can update drink specials they created" ON public.drink_specials;
DROP POLICY IF EXISTS "Users can delete drink specials they created" ON public.drink_specials;

CREATE POLICY "Establishment owners can update their drink specials" 
ON public.drink_specials 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants 
    WHERE restaurants.id = drink_specials.restaurant_id 
    AND restaurants.owner_id = auth.uid()
  )
);

CREATE POLICY "Establishment owners can delete their drink specials" 
ON public.drink_specials 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants 
    WHERE restaurants.id = drink_specials.restaurant_id 
    AND restaurants.owner_id = auth.uid()
  )
);

-- Update restaurants policies for ownership
CREATE POLICY "Establishment owners can update their restaurants" 
ON public.restaurants 
FOR UPDATE 
USING (auth.uid() = owner_id);

-- Add policy for owners to see their own restaurants
CREATE POLICY "Establishment owners can view their restaurants" 
ON public.restaurants 
FOR SELECT 
USING (auth.uid() = owner_id OR owner_id IS NULL);