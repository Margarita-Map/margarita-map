import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Globe, Star, ExternalLink } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
}

const WeeklySpotlight = () => {
  const navigate = useNavigate();
  const [spotlightRestaurant, setSpotlightRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpotlightRestaurant = async () => {
      try {
        // Get all restaurants
        const { data: restaurants, error } = await supabase
          .from('restaurants')
          .select('id, name, address, phone, website');

        if (error) throw error;

        if (restaurants && restaurants.length > 0) {
          // Use day number to ensure same restaurant shows all day
          const now = new Date();
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          const dayNumber = Math.ceil((now.getTime() - startOfYear.getTime()) / 86400000);
          
          // Use day number as seed for consistent random selection
          const selectedIndex = dayNumber % restaurants.length;
          setSpotlightRestaurant(restaurants[selectedIndex]);
        }
      } catch (error) {
        console.error('Error fetching spotlight restaurant:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpotlightRestaurant();
  }, []);

  if (loading) {
    return (
      <Card className="card-brutal bg-gradient-neon border-4 border-black">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-black text-center">
            🌟 SPOTLIGHT OF THE DAY 🌟
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-pulse text-lg font-bold">Loading today's featured establishment...</div>
        </CardContent>
      </Card>
    );
  }

  if (!spotlightRestaurant) {
    return null;
  }

  return (
    <Card className="card-brutal bg-gradient-electric border-4 border-black overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="text-2xl md:text-3xl font-black text-center flex items-center justify-center gap-2">
          <Star className="w-8 h-8 text-yellow-400 animate-pulse" />
          SPOTLIGHT OF THE DAY
          <Star className="w-8 h-8 text-yellow-400 animate-pulse" />
        </CardTitle>
        <p className="text-center text-sm opacity-90 font-semibold">
          FEATURING AN AMAZING ESTABLISHMENT FROM AROUND THE WORLD
        </p>
      </CardHeader>
      
      <CardContent className="p-6 bg-white">
        <div className="text-center space-y-4">
          <h3 className="text-3xl md:text-4xl font-black text-black mb-2 animate-bounce">
            {spotlightRestaurant.name}
          </h3>
          
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-lg font-semibold">
            <MapPin className="w-5 h-5" />
            <span>{spotlightRestaurant.address}</span>
          </div>

          <div className="flex flex-col gap-4 justify-center items-center">
            {spotlightRestaurant.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span className="font-medium">{spotlightRestaurant.phone}</span>
              </div>
            )}
            
            <Button 
              variant="neon" 
              size="lg"
              onClick={() => window.open(spotlightRestaurant.website || `https://www.google.com/search?q=${encodeURIComponent(spotlightRestaurant.name + ' ' + spotlightRestaurant.address)}`, '_blank')}
              className="font-bold w-full sm:w-auto"
            >
              <Globe className="w-5 h-5 mr-2" />
              {spotlightRestaurant.website ? 'VISIT WEBSITE' : 'SEARCH ONLINE'}
            </Button>
          </div>

          <div className="mt-6">
            <Button 
              variant="neon" 
              size="lg"
              onClick={() => navigate(`/establishment/${spotlightRestaurant.id}`)}
              className="w-full sm:w-auto"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              VIEW ESTABLISHMENT PAGE
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gradient-cyber rounded-lg border-2 border-black">
            <p className="text-black font-bold text-lg">
              🍹 DISCOVER WHAT MAKES THIS PLACE SPECIAL! 🍹
            </p>
            <p className="text-sm text-black/80 mt-2 font-medium">
              Check out their margaritas and share your experience with our community!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklySpotlight;