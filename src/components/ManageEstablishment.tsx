import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Plus, Wine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DrinkSpecialsForm from "./DrinkSpecialsForm";

interface Restaurant {
  id: string;
  name: string;
  address: string;
}

const ManageEstablishment = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [showSpecialsForm, setShowSpecialsForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('id, name, address')
          .order('name');

        if (error) {
          console.error('Error fetching restaurants:', error);
          toast({
            title: "Error",
            description: "Could not load restaurants. Please try again.",
            variant: "destructive"
          });
          return;
        }

        setRestaurants(data || []);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [toast]);

  const handleSpecialAdded = () => {
    setShowSpecialsForm(false);
    toast({
      title: "Success!",
      description: "Your drink special has been added.",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">Loading restaurants...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Manage Your Establishment
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select your establishment to manage drink specials and other features.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Your Restaurant/Bar</label>
            <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your establishment" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    <div>
                      <div className="font-medium">{restaurant.name}</div>
                      <div className="text-xs text-muted-foreground">{restaurant.address}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRestaurant && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Wine className="w-5 h-5" />
                  Daily Drink Specials
                </h3>
                <Button 
                  onClick={() => setShowSpecialsForm(!showSpecialsForm)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {showSpecialsForm ? "Cancel" : "Add Special"}
                </Button>
              </div>

              {showSpecialsForm && (
                <div className="animate-in slide-in-from-top duration-300">
                  <DrinkSpecialsForm 
                    restaurantId={selectedRestaurant}
                    onSuccess={handleSpecialAdded}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageEstablishment;