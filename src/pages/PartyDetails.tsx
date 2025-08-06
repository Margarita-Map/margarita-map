import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Clock, Users, ArrowLeft } from "lucide-react";
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

interface CheckIn {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  message: string | null;
  checked_in_at: string;
}

const PartyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [party, setParty] = useState<PartyPost | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [checkInData, setCheckInData] = useState({
    guest_name: "",
    message: ""
  });

  useSEO({
    title: party ? `${party.title} - Party Details` : "Party Details",
    description: party ? `Join the party at ${party.location}` : "View party details and check in with friends",
    keywords: "party, check-in, friends, nightlife, social"
  });

  useEffect(() => {
    checkUser();
    fetchPartyDetails();
    fetchCheckIns();
  }, [id]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchPartyDetails = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('party_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setParty(data);
    } catch (error) {
      console.error('Error fetching party details:', error);
      toast({
        title: "Error",
        description: "Could not load party details.",
        variant: "destructive"
      });
    }
  };

  const fetchCheckIns = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('party_checkins')
        .select('*')
        .eq('party_id', id)
        .order('checked_in_at', { ascending: false });

      if (error) throw error;
      setCheckIns(data || []);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    try {
      const checkInPayload = {
        party_id: id,
        user_id: user?.id || null,
        guest_name: user ? null : checkInData.guest_name,
        message: checkInData.message || null
      };

      const { error } = await supabase
        .from('party_checkins')
        .insert([checkInPayload]);

      if (error) throw error;

      toast({
        title: "Checked in!",
        description: "You've been added to the party list.",
      });

      setCheckInData({ guest_name: "", message: "" });
      setShowCheckInForm(false);
      fetchCheckIns();
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "Error",
        description: "Failed to check in to the party.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading party details...</div>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl mb-4">Party not found</h2>
          <Button onClick={() => navigate('/party-central')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Party Central
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700">
      <div className="container mx-auto px-4 py-8">
        <Button 
          onClick={() => navigate('/party-central')} 
          variant="outline" 
          className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Party Central
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Party Details */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-2">
                  🎉 {party.title}
                </CardTitle>
                <CardDescription className="text-white/70">
                  Posted {new Date(party.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="h-5 w-5" />
                  <span>{party.location}</span>
                </div>
                
                <div className="flex items-center gap-4 text-white/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{new Date(party.party_date).toLocaleDateString()}</span>
                  </div>
                  
                  {party.party_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>
                        {new Date(`2000-01-01T${party.party_time}`).toLocaleTimeString([], { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  )}
                </div>
                
                {party.description && (
                  <div className="mt-4">
                    <h3 className="text-white font-semibold mb-2">About this party</h3>
                    <p className="text-white/80">{party.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Check-in Form */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Check In to Party
                </CardTitle>
                <CardDescription className="text-white/70">
                  Let everyone know you're here!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showCheckInForm ? (
                  <Button 
                    onClick={() => setShowCheckInForm(true)}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    Check In to Party 🎉
                  </Button>
                ) : (
                  <form onSubmit={handleCheckIn} className="space-y-4">
                    {!user && (
                      <div>
                        <Label htmlFor="guest_name" className="text-white">Your Name</Label>
                        <Input
                          id="guest_name"
                          value={checkInData.guest_name}
                          onChange={(e) => setCheckInData({...checkInData, guest_name: e.target.value})}
                          placeholder="Enter your name"
                          required={!user}
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="message" className="text-white">Message (Optional)</Label>
                      <Textarea
                        id="message"
                        value={checkInData.message}
                        onChange={(e) => setCheckInData({...checkInData, message: e.target.value})}
                        placeholder="Say something to the party..."
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      >
                        Check In
                      </Button>
                      <Button 
                        type="button"
                        onClick={() => setShowCheckInForm(false)}
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Check-ins List */}
          <div>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Who's Here ({checkIns.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {checkIns.length === 0 ? (
                  <p className="text-white/70 text-center py-4">No one has checked in yet. Be the first!</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {checkIns.map((checkIn) => (
                      <div key={checkIn.id} className="bg-white/10 rounded-lg p-3">
                        <div className="font-semibold text-white">
                          {checkIn.guest_name || "Friend"}
                        </div>
                        <div className="text-white/60 text-sm">
                          {new Date(checkIn.checked_in_at).toLocaleTimeString([], { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </div>
                        {checkIn.message && (
                          <div className="text-white/80 text-sm mt-1">
                            "{checkIn.message}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyDetails;