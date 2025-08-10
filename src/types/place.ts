export interface PlaceDetails {
  id: string;
  name: string;
  address: string;
  rating?: number;
  priceLevel?: number;
  phoneNumber?: string;
  website?: string;
  photos?: string[];
  distance?: number; // Distance in miles
  location: {
    lat: number;
    lng: number;
  };
}