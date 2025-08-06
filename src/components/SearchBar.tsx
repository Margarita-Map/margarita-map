import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchBarProps {
  onSearch: (location: string) => void;
  isMapLoaded?: boolean;
}

const SearchBar = ({ onSearch, isMapLoaded = true }: SearchBarProps) => {
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      toast({
        title: "Enter a location",
        description: "Please enter a city, zip code, address, or bar/restaurant name to search.",
        variant: "destructive"
      });
      return;
    }

    if (!isMapLoaded) {
      toast({
        title: "Map loading...",
        description: "Please wait for the map to finish loading before searching.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearching(true);
    try {
      await onSearch(location.trim());
      toast({
        title: "Searching for bars...",
        description: `Finding margarita spots near ${location.trim()}`,
      });
    } catch (error) {
      toast({
        title: "Search error",
        description: "There was an issue searching for locations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!isMapLoaded) {
      toast({
        title: "Map loading...",
        description: "Please wait for the map to finish loading before using location.",
        variant: "destructive"
      });
      return;
    }

    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            await onSearch(`${latitude},${longitude}`);
            toast({
              title: "Using your location",
              description: "Finding margarita spots near you!",
            });
          } catch (error) {
            toast({
              title: "Search error",
              description: "There was an issue searching for locations. Please try again.",
              variant: "destructive"
            });
          } finally {
            setIsSearching(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location error",
            description: "Unable to get your location. Please enter it manually.",
            variant: "destructive"
          });
          setIsSearching(false);
        }
      );
    } else {
      toast({
        title: "Location not supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-4 md:p-6 shadow-sunset">
      <h3 className="text-lg md:text-xl font-bold mb-4 text-center leading-tight">
        Find the Best Margaritas Near You! 🍹
      </h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
          <Input
            type="text"
            placeholder="Enter city, zip code, address, or bar/restaurant name..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-12 h-14 md:h-12 text-base"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            type="button" 
            variant="tropical" 
            onClick={handleCurrentLocation}
            disabled={isSearching}
            className="h-14 md:h-12 px-4 w-full sm:w-auto text-base font-medium"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Finding Location...
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5 mr-2" />
                Use Current Location
              </>
            )}
          </Button>
          
          <Button 
            type="submit" 
            variant="festive" 
            disabled={isSearching || !location.trim() || !isMapLoaded}
            className="h-14 md:h-12 px-6 w-full sm:w-auto text-base font-bold"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Search Bars
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;