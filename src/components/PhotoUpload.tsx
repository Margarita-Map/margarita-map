import React, { useState, useCallback } from 'react';
import { Camera, X, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PhotoUploadProps {
  onPhotosChange: (photoUrls: string[]) => void;
  maxPhotos?: number;
  existingPhotos?: string[];
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotosChange,
  maxPhotos = 5,
  existingPhotos = []
}) => {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadPhoto = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `reviews/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('review-photos')
        .getPublicUrl(filePath);

      const newPhotos = [...photos, publicUrl];
      setPhotos(newPhotos);
      onPhotosChange(newPhotos);
      
      toast.success('Photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    const newPhotos = photos.filter((_, index) => index !== indexToRemove);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    processFiles(Array.from(files));
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      if (photos.length < maxPhotos && file.type.startsWith('image/')) {
        uploadPhoto(file);
      }
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  }, [photos.length, maxPhotos]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Camera className="h-4 w-4" />
        <span className="text-sm font-medium">Add Photos ({photos.length}/{maxPhotos})</span>
      </div>
      
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Review photo ${index + 1}`}
                className="w-full h-20 object-cover rounded-md"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < maxPhotos && (
        <div 
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="photo-upload"
            disabled={uploading}
          />
          
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Image className={`h-8 w-8 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">
                {isDragOver ? 'Drop photos here!' : 'Drag & drop photos here'}
              </div>
              <div className="text-xs text-muted-foreground">
                or click to browse files
              </div>
            </div>
            <label htmlFor="photo-upload">
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                disabled={uploading}
                asChild
              >
                <span className="flex items-center gap-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Browse Files'}
                </span>
              </Button>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};