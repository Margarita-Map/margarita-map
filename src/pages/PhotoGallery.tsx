import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Upload, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSEO } from '@/hooks/useSEO';
import Navbar from '@/components/Navbar';

interface PartyPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  location_name: string;
  location_address: string | null;
  created_at: string;
  profiles?: {
    display_name: string | null;
  } | null;
}

const PhotoGallery = () => {
  const [photos, setPhotos] = useState<PartyPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    caption: '',
    locationName: '',
    locationAddress: ''
  });

  useSEO({
    title: "Party Photo Gallery - Share Your Margarita Moments",
    description: "Share and discover amazing party photos from margarita lovers around the world. Upload your fun moments and see where the party is happening globally.",
    keywords: "party photos, margarita photos, nightlife, bars, restaurants, social, community"
  });

  useEffect(() => {
    checkUser();
    fetchPhotos();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('party_photos')
        .select(`
          *,
          profiles (display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos((data as any) || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!formData.locationName.trim()) {
      toast.error('Please enter a location name first');
      return;
    }

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `party-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('review-photos')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('party_photos')
        .insert({
          user_id: user.id,
          photo_url: publicUrl,
          caption: formData.caption.trim() || null,
          location_name: formData.locationName.trim(),
          location_address: formData.locationAddress.trim() || null
        });

      if (insertError) throw insertError;

      toast.success('Photo uploaded successfully!');
      setFormData({ caption: '', locationName: '', locationAddress: '' });
      setShowUploadForm(false);
      fetchPhotos();
      
      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">Loading photos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Party Photo Gallery</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Share your margarita moments from around the world
          </p>
          {user ? (
            <Button 
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="bg-primary hover:bg-primary/90"
            >
              <Camera className="h-4 w-4 mr-2" />
              Share Your Photo
            </Button>
          ) : (
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In to Share Photos
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Upload Form */}
        {showUploadForm && user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Party Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Location Name *
                </label>
                <Input
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  placeholder="e.g., Margarita Paradise Bar"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Address (Optional)
                </label>
                <Input
                  value={formData.locationAddress}
                  onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                  placeholder="e.g., 123 Beach St, Miami, FL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Caption (Optional)
                </label>
                <Textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Tell us about your party experience..."
                  rows={3}
                />
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploading}
                />
                <label htmlFor="photo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={uploading}
                    asChild
                  >
                    <span className="flex items-center gap-2 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      {uploading ? 'Uploading...' : 'Choose Photo'}
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photo Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || `Photo from ${photo.location_name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">{photo.location_name}</p>
                        {photo.location_address && (
                          <p className="text-xs text-muted-foreground">{photo.location_address}</p>
                        )}
                      </div>
                    </div>
                    
                    {photo.caption && (
                      <p className="text-sm text-foreground">{photo.caption}</p>
                    )}
                    
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {photo.profiles?.display_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(photo.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No photos yet</h2>
            <p className="text-muted-foreground mb-4">
              Be the first to share your party photos!
            </p>
            {user && (
              <Button onClick={() => setShowUploadForm(true)}>
                <Camera className="h-4 w-4 mr-2" />
                Upload Your First Photo
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;