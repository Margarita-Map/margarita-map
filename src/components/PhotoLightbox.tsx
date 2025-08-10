import React from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, User } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Photo {
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

interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const PhotoLightbox = ({ photos, currentIndex, onClose, onNext, onPrevious }: PhotoLightboxProps) => {
  if (currentIndex === null || !photos[currentIndex]) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <Dialog open={currentIndex !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-background/95 backdrop-blur-sm">
        <div className="relative w-full h-full">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Navigation buttons */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
                onClick={onPrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
                onClick={onNext}
                disabled={currentIndex === photos.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Image */}
          <div className="flex flex-col h-full">
            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={currentPhoto.photo_url}
                alt={currentPhoto.caption || `Photo from ${currentPhoto.location_name}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            {/* Photo details */}
            <div className="p-6 bg-background border-t">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{currentPhoto.location_name}</p>
                    {currentPhoto.location_address && (
                      <p className="text-sm text-muted-foreground">{currentPhoto.location_address}</p>
                    )}
                  </div>
                </div>
                
                {currentPhoto.caption && (
                  <p className="text-foreground">{currentPhoto.caption}</p>
                )}
                
                <div className="flex items-center gap-2 pt-2 border-t">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {currentPhoto.profiles?.display_name || 'Anonymous'}
                  </span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(currentPhoto.created_at).toLocaleDateString()}
                  </span>
                  {photos.length > 1 && (
                    <>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {currentIndex + 1} of {photos.length}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoLightbox;