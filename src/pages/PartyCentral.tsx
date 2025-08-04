import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

interface PartyPost {
  id: string;
  title: string;
  location: string;
  description: string;
  party_date: string;
  party_time: string;
  created_at: string;
  user_id: string;
}

const PartyCentral = () => {
  useSEO({
    title: "Party Central - Share Your Party Plans",
    description: "Connect with friends and share where you'll be partying tonight!",
    keywords: "party, social, friends, nightlife, events"
  });

  const [posts, setPosts] = useState<PartyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    party_date: "",
    party_time: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchPosts();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('party_posts')
        .select('*')
        .order('party_date', { ascending: true })
        .order('party_time', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a party post.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('party_posts')
        .insert([{
          ...formData,
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Party posted!",
        description: "Your party has been shared with friends.",
      });

      setFormData({
        title: "",
        location: "",
        description: "",
        party_date: "",
        party_time: ""
      });
      setShowForm(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create party post.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading parties...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🎉 Party Central 🎉
          </h1>
          <p className="text-xl text-white/80 mb-6">
            Share where you're partying and see where friends are going!
          </p>
          
          {user ? (
            <Button 
              onClick={() => setShowForm(!showForm)}
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Users className="mr-2 h-5 w-5" />
              {showForm ? "Cancel" : "Share Your Party Plans"}
            </Button>
          ) : (
            <Card className="max-w-md mx-auto bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6 text-center">
                <p className="text-white mb-4">Sign in to share your party plans!</p>
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  Sign In
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {showForm && (
          <Card className="max-w-2xl mx-auto mb-8 bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Create Party Post</CardTitle>
              <CardDescription className="text-white/70">
                Let your friends know where the party's at!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white">Party Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Margarita Monday at Joe's!"
                    required
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location" className="text-white">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., Blue Margarita Bar, 123 Main St"
                    required
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="party_date" className="text-white">Date</Label>
                    <Input
                      id="party_date"
                      type="date"
                      value={formData.party_date}
                      onChange={(e) => setFormData({...formData, party_date: e.target.value})}
                      required
                      className="bg-white/20 border-white/30 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="party_time" className="text-white">Time</Label>
                    <Input
                      id="party_time"
                      type="time"
                      value={formData.party_time}
                      onChange={(e) => setFormData({...formData, party_time: e.target.value})}
                      className="bg-white/20 border-white/30 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-white">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Tell friends what to expect..."
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  Share Party! 🎉
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-white/70 text-lg">No parties posted yet. Be the first to share!</p>
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    🎉 {post.title}
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Posted recently
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{post.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(post.party_date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {post.party_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          {new Date(`2000-01-01T${post.party_time}`).toLocaleTimeString([], { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {post.description && (
                    <p className="text-white/80 text-sm">{post.description}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PartyCentral;