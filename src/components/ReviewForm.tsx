import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Star, DollarSign, MapPin, User, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const reviewSchema = z.object({
  restaurant_name: z.string().min(1, "Restaurant name is required"),
  restaurant_address: z.string().min(1, "Restaurant address is required"),
  agave_rating: z.number().min(1).max(5),
  price_point: z.number().min(1).max(4).optional(),
  taste_notes: z.string().optional(),
  would_recommend: z.boolean(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  selectedPlace?: {
    name: string;
    address: string;
    id: string;
  };
}

const ReviewForm = ({ selectedPlace }: ReviewFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Get selected place from router state if available
  const routerState = location.state as { selectedPlace?: any } | null;
  const placeInfo = selectedPlace || routerState?.selectedPlace;

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      restaurant_name: placeInfo?.name || "",
      restaurant_address: placeInfo?.address || "",
      agave_rating: 3,
      price_point: 2,
      taste_notes: "",
      would_recommend: true,
    },
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const getRatingLabel = (rating: number) => {
    const labels = {
      1: "Poor - Not recommended",
      2: "Fair - Below average",
      3: "Good - Average quality",
      4: "Great - Above average",
      5: "Excellent - Must try!"
    };
    return labels[rating as keyof typeof labels];
  };

  const getPriceLabel = (price: number) => {
    const labels = {
      1: "Budget-friendly ($5-8)",
      2: "Moderate ($9-12)",
      3: "Upscale ($13-16)",
      4: "Premium ($17+)"
    };
    return labels[price as keyof typeof labels];
  };

  const onSubmit = async (data: ReviewFormValues) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a review.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      // First, create or find the restaurant
      let restaurantId;
      
      // Check if restaurant already exists
      const { data: existingRestaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('name', data.restaurant_name)
        .eq('address', data.restaurant_address)
        .single();

      if (existingRestaurant) {
        restaurantId = existingRestaurant.id;
      } else {
        // Create new restaurant
        const { data: newRestaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .insert({
            name: data.restaurant_name,
            address: data.restaurant_address,
          })
          .select('id')
          .single();

        if (restaurantError) throw restaurantError;
        restaurantId = newRestaurant.id;
      }

      // Create the review
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          restaurant_id: restaurantId,
          agave_rating: data.agave_rating,
          price_point: data.price_point,
          taste_notes: data.taste_notes,
          would_recommend: data.would_recommend,
        });

      if (reviewError) throw reviewError;

      toast({
        title: "Review Submitted! 🍹",
        description: "Thank you for sharing your margarita experience!",
      });

      // Navigate back to home page
      navigate('/');
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="w-5 h-5" />
            Free Sign Up Required
          </CardTitle>
          <CardDescription>
            It's completely free! Just enter your email and password to start rating drinks.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>✅ Free to join</p>
            <p>✅ Only email & password needed</p>
            <p>✅ Start rating immediately</p>
          </div>
          <Button onClick={() => navigate('/auth')} className="w-full sm:w-auto bg-gradient-sunset hover:bg-gradient-sunset/90 text-white border-0">
            <LogIn className="w-4 h-4 mr-2" />
            Sign Up Free / Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Rate Your Margarita Experience
        </CardTitle>
        <CardDescription>
          Share your thoughts and help others discover great margaritas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="restaurant_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant/Bar Name</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter establishment name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="restaurant_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="agave_rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <img src="/src/assets/agave-rating.png" alt="Agave" className="w-5 h-5" />
                    Agave Rating
                  </FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          <div className="flex items-center gap-2">
                            <Badge variant={rating <= 2 ? "destructive" : rating === 3 ? "outline" : rating === 4 ? "default" : "default"} 
                                   className={rating === 5 ? "bg-gradient-sunset text-white border-0" : ""}>
                              {rating}
                            </Badge>
                            <span>{getRatingLabel(rating)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price_point"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price Point (Optional)
                  </FormLabel>
                  <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                          defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4].map((price) => (
                        <SelectItem key={price} value={price.toString()}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{"$".repeat(price)}</span>
                            <span>{getPriceLabel(price)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taste_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taste Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the flavors, presentation, or what made this margarita special..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="would_recommend"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Would you recommend this drink?
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Help others know if this margarita is worth trying
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-sunset hover:bg-gradient-sunset/90 text-white border-0"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;