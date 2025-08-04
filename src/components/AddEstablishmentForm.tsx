import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Globe, Building } from "lucide-react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddEstablishmentFormProps {
  onSuccess?: () => void;
}

const AddEstablishmentForm = ({ onSuccess }: AddEstablishmentFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    website: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { geocodeAddress, isLoaded } = useGoogleMaps();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.address.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in the establishment name and address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get coordinates from address using Google Maps geocoding
      let latitude: number | null = null;
      let longitude: number | null = null;

      if (isLoaded) {
        const location = await geocodeAddress(formData.address);
        if (location) {
          latitude = location.lat();
          longitude = location.lng();
        }
      }

      // Clean website URL
      let website = formData.website.trim();
      if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
        website = `https://${website}`;
      }

      // Insert into restaurants table
      const { error } = await supabase
        .from('restaurants')
        .insert({
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim() || null,
          website: website || null,
          latitude,
          longitude
        });

      if (error) {
        console.error('Error adding restaurant:', error);
        toast({
          title: "Error Adding Establishment",
          description: "There was an error adding your establishment. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Establishment Added Successfully!",
        description: "Your establishment has been added and will appear in search results.",
      });

      // Reset form
      setFormData({
        name: "",
        address: "",
        phone: "",
        website: ""
      });

      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Error adding establishment:', error);
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Add Your Establishment
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Don't see your bar or restaurant in our listings? Add it here so customers can find and review your establishment.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Establishment Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., The Margarita House"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Full Address *
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="e.g., 123 Main Street, Austin, TX 78701"
              required
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Include street address, city, state, and zip code for accurate location mapping
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="e.g., (555) 123-4567"
              type="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="e.g., www.margaritahouse.com"
              type="url"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Adding Establishment..." : "Add Establishment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddEstablishmentForm;