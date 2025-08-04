import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, Wine, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DrinkSpecialsFormProps {
  restaurantId: string;
  onSuccess?: () => void;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
  { value: 'daily', label: 'Daily' }
];

const DrinkSpecialsForm = ({ restaurantId, onSuccess }: DrinkSpecialsFormProps) => {
  const [formData, setFormData] = useState({
    drinkName: "",
    description: "",
    specialPrice: "",
    regularPrice: "",
    dayOfWeek: "",
    startTime: "",
    endTime: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.drinkName.trim() || !formData.dayOfWeek) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in the drink name and day of week.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const specialData = {
        restaurant_id: restaurantId,
        drink_name: formData.drinkName.trim(),
        description: formData.description.trim() || null,
        special_price: formData.specialPrice ? parseFloat(formData.specialPrice) : null,
        regular_price: formData.regularPrice ? parseFloat(formData.regularPrice) : null,
        day_of_week: formData.dayOfWeek,
        start_time: formData.startTime || null,
        end_time: formData.endTime || null,
        is_active: true
      };

      const { error } = await supabase
        .from('drink_specials')
        .insert(specialData);

      if (error) {
        console.error('Error adding drink special:', error);
        toast({
          title: "Error Adding Special",
          description: "There was an error adding your drink special. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Drink Special Added!",
        description: "Your drink special has been added successfully.",
      });

      // Reset form
      setFormData({
        drinkName: "",
        description: "",
        specialPrice: "",
        regularPrice: "",
        dayOfWeek: "",
        startTime: "",
        endTime: ""
      });

      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Error adding drink special:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wine className="w-5 h-5" />
          Add Daily Drink Special
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Advertise your daily drink specials to attract more customers.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="drinkName" className="flex items-center gap-2">
                <Wine className="w-4 h-4" />
                Drink Name *
              </Label>
              <Input
                id="drinkName"
                value={formData.drinkName}
                onChange={(e) => handleInputChange("drinkName", e.target.value)}
                placeholder="e.g., House Margarita"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dayOfWeek" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Day of Week *
              </Label>
              <Select value={formData.dayOfWeek} onValueChange={(value) => handleInputChange("dayOfWeek", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map(day => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="e.g., Premium tequila with fresh lime juice and agave nectar"
              rows={2}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="specialPrice" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Special Price
              </Label>
              <Input
                id="specialPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.specialPrice}
                onChange={(e) => handleInputChange("specialPrice", e.target.value)}
                placeholder="e.g., 8.99"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regularPrice" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Regular Price
              </Label>
              <Input
                id="regularPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.regularPrice}
                onChange={(e) => handleInputChange("regularPrice", e.target.value)}
                placeholder="e.g., 12.99"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Adding Special..." : "Add Drink Special"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DrinkSpecialsForm;