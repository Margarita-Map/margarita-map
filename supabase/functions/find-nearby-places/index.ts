import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { latitude, longitude, radius = 5000 } = await req.json()
    
    const apiKey = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY')
    if (!apiKey) {
      throw new Error('Google Maps API key not configured')
    }

    // Search for Mexican restaurants and bars
    const searchQueries = [
      'Mexican restaurant',
      'tequila bar',
      'Mexican cantina',
      'margarita bar'
    ]

    const allPlaces = []

    for (const query of searchQueries) {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${latitude},${longitude}&radius=${radius}&type=restaurant&key=${apiKey}`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.status === 'OK' && data.results) {
        const places = data.results.slice(0, 5).map((place: any) => ({
          id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          rating: place.rating,
          priceLevel: place.price_level,
          photos: place.photos ? place.photos.map((photo: any) => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
          ) : [],
          placeTypes: place.types,
          businessStatus: place.business_status
        }))
        
        allPlaces.push(...places)
      }
    }

    // Remove duplicates and limit results
    const uniquePlaces = allPlaces.filter((place, index, self) => 
      index === self.findIndex(p => p.id === place.id)
    ).slice(0, 12)

    // Calculate distances
    const placesWithDistance = uniquePlaces.map(place => {
      const distance = calculateDistance(
        latitude,
        longitude,
        place.location.lat,
        place.location.lng
      )
      return { ...place, distance }
    })

    // Sort by rating and distance
    const sortedPlaces = placesWithDistance
      .filter(place => place.businessStatus !== 'CLOSED_PERMANENTLY')
      .sort((a, b) => {
        const ratingDiff = (b.rating || 0) - (a.rating || 0)
        if (Math.abs(ratingDiff) > 0.3) return ratingDiff
        return (a.distance || 0) - (b.distance || 0)
      })

    return new Response(
      JSON.stringify({ places: sortedPlaces }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error finding nearby places:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}