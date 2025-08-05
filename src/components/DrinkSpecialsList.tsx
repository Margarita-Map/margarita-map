import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wine, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DrinkSpecial {
  id: string;
  drink_name: string;
  description: string | null;
  special_price: number | null;
  regular_price: number | null;
  day_of_week: string;
  start_time: string | null;
  end_time: string | null;
  restaurant: {
    name: string;
    address: string;
  };
}

interface DrinkSpecialsListProps {
  restaurantIds?: string[];
  maxItems?: number;
}

const DrinkSpecialsList = ({ restaurantIds, maxItems = 10 }: DrinkSpecialsListProps) => {
  const [specials, setSpecials] = useState<DrinkSpecial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecials = async () => {
      try {
        let query = supabase
          .from('drink_specials')
          .select(`
            id,
            drink_name,
            description,
            special_price,
            regular_price,
            day_of_week,
            start_time,
            end_time,
            restaurants!inner (
              name,
              address
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        // Only show drink specials for Supabase restaurants (not Google Places)
        // Don't filter by restaurantIds since they are Google Place IDs, not Supabase UUIDs

        if (maxItems) {
          query = query.limit(maxItems);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching drink specials:', error);
          return;
        }

        // Transform the data to match our interface
        const transformedData = data?.map(item => ({
          id: item.id,
          drink_name: item.drink_name,
          description: item.description,
          special_price: item.special_price,
          regular_price: item.regular_price,
          day_of_week: item.day_of_week,
          start_time: item.start_time,
          end_time: item.end_time,
          restaurant: {
            name: item.restaurants.name,
            address: item.restaurants.address
          }
        })) || [];

        setSpecials(transformedData);
      } catch (error) {
        console.error('Error fetching drink specials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecials();
  }, [maxItems]);

  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const formatTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatPrice = (price: number | null) => {
    if (!price) return null;
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">Loading drink specials...</p>
      </div>
    );
  }

  if (specials.length === 0) {
    return (
      <div className="text-center py-8">
        <Wine className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Current Specials</h3>
        <p className="text-muted-foreground mb-2">
          Check back later for amazing drink deals!
        </p>
        <p className="text-sm text-muted-foreground">
          Specials are updated daily by local establishments
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {specials.map((special) => (
        <Card key={special.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Wine className="w-5 h-5 text-primary" />
                  {special.drink_name}
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  {special.restaurant.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {special.restaurant.address}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="secondary">
                  {formatDay(special.day_of_week)}
                </Badge>
                {(special.start_time || special.end_time) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {special.start_time && formatTime(special.start_time)}
                    {special.start_time && special.end_time && " - "}
                    {special.end_time && formatTime(special.end_time)}
                  </div>
                )}
              </div>
            </div>

            {special.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {special.description}
              </p>
            )}

            <div className="flex items-center gap-4">
              {special.special_price && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">
                    {formatPrice(special.special_price)}
                  </span>
                  <span className="text-xs text-muted-foreground">special</span>
                </div>
              )}
              {special.regular_price && (
                <div className="flex items-center gap-1">
                  <span className={`text-sm ${special.special_price ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {formatPrice(special.regular_price)}
                  </span>
                  {special.special_price && (
                    <span className="text-xs text-muted-foreground">regular</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DrinkSpecialsList;