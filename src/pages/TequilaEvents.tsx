import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Phone, Globe, DollarSign } from "lucide-react";

interface TequilaEvent {
  id: string;
  title: string;
  description: string;
  venue_name: string;
  venue_address: string;
  event_date: string;
  event_time: string;
  contact_info: string;
  website: string;
  price: string;
  created_at: string;
}

export default function TequilaEvents() {
  const [events, setEvents] = useState<TequilaEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue_name: "",
    venue_address: "",
    event_date: "",
    event_time: "",
    contact_info: "",
    website: "",
    price: ""
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("tequila_events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
      return;
    }

    setEvents(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("tequila_events")
      .insert([formData]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Event posted successfully!",
      });
      setFormData({
        title: "",
        description: "",
        venue_name: "",
        venue_address: "",
        event_date: "",
        event_time: "",
        contact_info: "",
        website: "",
        price: ""
      });
      setShowForm(false);
      fetchEvents();
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Tequila Tasting Events</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Discover and share tequila tasting events in your area
          </p>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            {showForm ? "Cancel" : "Post an Event"}
          </Button>
        </div>

        {showForm && (
          <Card className="max-w-2xl mx-auto mb-8">
            <CardHeader>
              <CardTitle>Post a Tequila Tasting Event</CardTitle>
              <CardDescription>
                Share your tequila tasting event with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Premium Tequila Tasting Night"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Join us for an evening of premium tequila tastings..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="venue_name">Venue Name *</Label>
                    <Input
                      id="venue_name"
                      required
                      value={formData.venue_name}
                      onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                      placeholder="Agave Restaurant & Bar"
                    />
                  </div>

                  <div>
                    <Label htmlFor="venue_address">Venue Address *</Label>
                    <Input
                      id="venue_address"
                      required
                      value={formData.venue_address}
                      onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
                      placeholder="123 Main St, City, State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event_date">Event Date *</Label>
                    <Input
                      id="event_date"
                      type="date"
                      required
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="event_time">Event Time</Label>
                    <Input
                      id="event_time"
                      type="time"
                      value={formData.event_time}
                      onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_info">Contact Info</Label>
                    <Input
                      id="contact_info"
                      value={formData.contact_info}
                      onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                      placeholder="Phone or email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="$50 per person"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://venue-website.com"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Posting..." : "Post Event"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{event.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    {event.venue_name}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.description && (
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {event.venue_address}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(event.event_date)}
                  </div>

                  {event.event_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatTime(event.event_time)}
                    </div>
                  )}

                  {event.price && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {event.price}
                    </div>
                  )}

                  {event.contact_info && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {event.contact_info}
                    </div>
                  )}

                  {event.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={event.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No events posted yet. Be the first to share a tequila tasting event!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}