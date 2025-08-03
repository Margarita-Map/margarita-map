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
    <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-sunset">
      <h3 className="text-xl font-bold mb-4 text-center">
        Find the Best Margaritas Near You! 🍹
      </h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Enter city, zip code, or address..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="tropical" 
            onClick={handleCurrentLocation}
            className="h-12 px-4"
          >
            <MapPin className="w-4 h-4" />
            Current
          </Button>
          
          <Button type="submit" variant="festive" className="h-12 px-6">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;