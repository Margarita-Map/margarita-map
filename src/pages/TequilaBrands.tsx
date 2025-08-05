import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSEO } from "@/hooks/useSEO";

interface TequilaBrand {
  id: string;
  name: string;
  description: string | null;
  user_submitted: boolean;
  vote_count: number;
  user_voted: boolean;
}

export default function TequilaBrands() {
  useSEO({
    title: "Vote for Your Favorite Tequila Brand | Margarita Quest Hub",
    description: "Vote for your favorite tequila brands and discover the most popular choices among margarita lovers. Add new brands to the voting list.",
    keywords: "tequila brands, tequila voting, favorite tequila, margarita ingredients, best tequila"
  });

  const [brands, setBrands] = useState<TequilaBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandDescription, setNewBrandDescription] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [votedBrands, setVotedBrands] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkUser();
    loadVotedBrands();
    fetchBrands();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadVotedBrands = () => {
    try {
      const saved = localStorage.getItem('tequila-votes');
      if (saved) {
        setVotedBrands(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Error loading saved votes:', error);
    }
  };

  const saveVotedBrands = (brands: Set<string>) => {
    try {
      localStorage.setItem('tequila-votes', JSON.stringify([...brands]));
    } catch (error) {
      console.error('Error saving votes:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      // Get brands with vote counts
      const { data: brandsData, error: brandsError } = await supabase
        .from('tequila_brands')
        .select(`
          id,
          name,
          description,
          user_submitted
        `);

      if (brandsError) throw brandsError;

      // Get vote counts for each brand
      const { data: votesData, error: votesError } = await supabase
        .from('brand_votes')
        .select('brand_id');

      if (votesError) throw votesError;

      // Count votes per brand
      const voteCounts = votesData.reduce((acc, vote) => {
        acc[vote.brand_id] = (acc[vote.brand_id] || 0) + 1;
        return acc;
      }, {});

      // For anonymous voting, use localStorage to track votes
      const localVotes = Array.from(votedBrands);

      // Combine data
      const brandsWithVotes = brandsData.map(brand => ({
        ...brand,
        vote_count: voteCounts[brand.id] || 0,
        user_voted: localVotes.includes(brand.id)
      }));

      // Sort by vote count (descending)
      brandsWithVotes.sort((a, b) => b.vote_count - a.vote_count);

      setBrands(brandsWithVotes);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast({
        title: "Error",
        description: "Failed to load tequila brands",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (brandId: string) => {
    try {
      const brand = brands.find(b => b.id === brandId);
      if (!brand) return;

      const newVotedBrands = new Set(votedBrands);

      if (brand.user_voted) {
        // Remove vote from database and localStorage
        const { error } = await supabase
          .from('brand_votes')
          .delete()
          .eq('brand_id', brandId);

        if (error) throw error;

        newVotedBrands.delete(brandId);
        setVotedBrands(newVotedBrands);
        saveVotedBrands(newVotedBrands);

        toast({
          title: "Vote removed",
          description: `Removed your vote for ${brand.name}`,
        });
      } else {
        // Add vote to database and localStorage
        const { error } = await supabase
          .from('brand_votes')
          .insert({
            brand_id: brandId,
            user_id: user?.id || null
          });

        if (error) throw error;

        newVotedBrands.add(brandId);
        setVotedBrands(newVotedBrands);
        saveVotedBrands(newVotedBrands);

        toast({
          title: "Vote cast",
          description: `Voted for ${brand.name}!`,
        });
      }

      // Refresh brands
      fetchBrands();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to cast vote",
        variant: "destructive",
      });
    }
  };

  const handleAddBrand = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add new brands",
        variant: "destructive",
      });
      return;
    }

    if (!newBrandName.trim()) {
      toast({
        title: "Brand name required",
        description: "Please enter a brand name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tequila_brands')
        .insert({
          name: newBrandName.trim(),
          description: newBrandDescription.trim() || null,
          user_submitted: true,
          submitted_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Brand added",
        description: `${newBrandName} has been added to the voting list`,
      });

      setNewBrandName("");
      setNewBrandDescription("");
      setIsAddDialogOpen(false);
      fetchBrands();
    } catch (error) {
      console.error('Error adding brand:', error);
      toast({
        title: "Error",
        description: "Failed to add brand. It may already exist.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-4">
        <div className="container mx-auto">
          <div className="text-center">Loading tequila brands...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4 flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8" />
            Vote for Your Favorite Tequila
          </h1>
          <p className="text-muted-foreground text-lg">
            Vote for your favorite tequila brands and see what the community loves most!
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Brand
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Tequila Brand</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="brand-name">Brand Name</Label>
                  <Input
                    id="brand-name"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Enter brand name"
                  />
                </div>
                <div>
                  <Label htmlFor="brand-description">Description (Optional)</Label>
                  <Textarea
                    id="brand-description"
                    value={newBrandDescription}
                    onChange={(e) => setNewBrandDescription(e.target.value)}
                    placeholder="Brief description of the brand"
                  />
                </div>
                <Button onClick={handleAddBrand} className="w-full">
                  Add Brand
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand, index) => (
            <Card key={brand.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {index < 3 && (
                      <Trophy className={`h-5 w-5 ${
                        index === 0 ? 'text-yellow-500' : 
                        index === 1 ? 'text-gray-400' : 
                        'text-orange-500'
                      }`} />
                    )}
                    {brand.name}
                  </span>
                  {brand.user_submitted && (
                    <Badge variant="secondary">Community</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {brand.description && (
                  <p className="text-muted-foreground text-sm mb-4">
                    {brand.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {brand.vote_count} votes
                  </span>
                  <Button
                    variant={brand.user_voted ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleVote(brand.id)}
                    className="gap-2"
                  >
                    <Heart className={`h-4 w-4 ${brand.user_voted ? 'fill-current' : ''}`} />
                    {brand.user_voted ? 'Voted' : 'Vote'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!user && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Sign in to add new brands to the voting list!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}