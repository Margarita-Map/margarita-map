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
    
    console.log(`Searching for places near ${latitude}, ${longitude} within ${radius}m`)
    
    const apiKey = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY')
    if (!apiKey) {
      console.error('Google Maps API key not configured')
      throw new Error('Google Maps API key not configured')
    }

    console.log('API Key found, proceeding with search...')

    // Use Google Places Nearby Search API
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=restaurant&keyword=mexican&key=${apiKey}`
    
    console.log('Calling Google Places API:', url.replace(apiKey, 'API_KEY_HIDDEN'))
    
    const response = await fetch(url)
    const data = await response.json()

    console.log('Google Places API response status:', data.status)
    console.log('Number of results:', data.results?.length || 0)
    
    if (data.status === 'OK' && data.results) {
      console.log('Successfully got results from Google Places')
      
      const places = data.results.slice(0, 12).map((place: any) => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        rating: place.rating,
        priceLevel: place.price_level,
        photos: place.photos ? place.photos.slice(0, 1).map((photo: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
        ) : [],
        placeTypes: place.types,
        businessStatus: place.business_status
      }))

      // Calculate distances
      const placesWithDistance = places.map(place => {
        const distance = calculateDistance(
          latitude,
          longitude,
          place.location.lat,
          place.location.lng
        )
        return { ...place, distance }
      })

      // Filter and sort places
      const filteredPlaces = placesWithDistance
        .filter(place => place.businessStatus !== 'CLOSED_PERMANENTLY')
        .sort((a, b) => {
          const ratingDiff = (b.rating || 0) - (a.rating || 0)
          if (Math.abs(ratingDiff) > 0.3) return ratingDiff
          return (a.distance || 0) - (b.distance || 0)
        })

      console.log(`Returning ${filteredPlaces.length} filtered places`)
      
      return new Response(
        JSON.stringify({ places: filteredPlaces }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } else {
      console.error('Google Places API error:', data.status, data.error_message)
      return new Response(
        JSON.stringify({ places: [], error: `Google Places API error: ${data.status}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }
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