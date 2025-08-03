import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (location: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onSearch(location.trim());
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onSearch(`${latitude},${longitude}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enter it manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
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
            placeholder="Enter city, zip code, or address..."
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
            className="h-14 md:h-12 px-4 w-full sm:w-auto text-base font-medium"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Use Current Location
          </Button>
          
          <Button type="submit" variant="festive" className="h-14 md:h-12 px-6 w-full sm:w-auto text-base font-bold">
            <Search className="w-5 h-5 mr-2" />
            Search Bars
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;