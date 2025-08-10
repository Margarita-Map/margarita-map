import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PlaceMap from './PlaceMap';

interface PlaceMapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  place: {
    name: string;
    location: {
      lat: number;
      lng: number;
    };
    address: string;
  };
}

const PlaceMapDialog = ({ isOpen, onClose, place }: PlaceMapDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold">
            {place.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {place.address}
          </p>
        </DialogHeader>
        <div className="flex-1 p-6 pt-4">
          <PlaceMap
            latitude={place.location.lat}
            longitude={place.location.lng}
            placeName={place.name}
            className="w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceMapDialog;