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
    const { latitude, longitude, radius = 8000 } = await req.json()
    
    console.log(`Searching for places near ${latitude}, ${longitude} within ${radius}m`)
    
    const apiKey = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY')
    if (!apiKey) {
      console.error('Google Maps API key not configured')
      throw new Error('Google Maps API key not configured')
    }

    console.log('API Key found, proceeding with search...')

    // Try multiple search approaches
    const searchApproaches = [
      // First try Mexican restaurants specifically
      {
        url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=restaurant&keyword=mexican&key=${apiKey}`,
        name: 'Mexican keyword search'
      },
      // Then try text search for Mexican food
      {
        url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=mexican+restaurant&location=${latitude},${longitude}&radius=${radius}&key=${apiKey}`,
        name: 'Mexican text search'
      },
      // Finally try broader restaurant search
      {
        url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=restaurant&key=${apiKey}`,
        name: 'All restaurants search'
      }
    ]

    let allPlaces = []

    for (const approach of searchApproaches) {
      console.log(`Trying ${approach.name}:`, approach.url.replace(apiKey, 'API_KEY_HIDDEN'))
      
      const response = await fetch(approach.url)
      const data = await response.json()

      console.log(`${approach.name} - Status:`, data.status)
      console.log(`${approach.name} - Results:`, data.results?.length || 0)
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const places = data.results.slice(0, 8).map((place: any) => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity || place.formatted_address,
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          rating: place.rating || 4.0,
          priceLevel: place.price_level || 2,
          photos: place.photos ? place.photos.slice(0, 1).map((photo: any) => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
          ) : [],
          placeTypes: place.types || ['restaurant'],
          businessStatus: place.business_status || 'OPERATIONAL'
        }))

        allPlaces.push(...places)
        
        // If we found Mexican restaurants, prioritize them and break
        if (approach.name.includes('Mexican') && places.length > 0) {
          console.log(`Found ${places.length} Mexican restaurants, using these`)
          break
        }
      } else if (data.error_message) {
        console.error(`${approach.name} error:`, data.error_message)
      }
    }

    if (allPlaces.length === 0) {
      console.log('No places found, returning empty result')
      return new Response(
        JSON.stringify({ places: [], error: 'No restaurants found in your area' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Remove duplicates
    const uniquePlaces = allPlaces.filter((place, index, self) => 
      index === self.findIndex(p => p.id === place.id)
    )

    // Calculate distances and filter
    const placesWithDistance = uniquePlaces.map(place => {
      const distance = calculateDistance(
        latitude,
        longitude,
        place.location.lat,
        place.location.lng
      )
      return { ...place, distance }
    })

    // Filter Mexican restaurants first, then others
    const mexicanPlaces = placesWithDistance.filter(place => 
      place.name.toLowerCase().includes('mexican') || 
      place.name.toLowerCase().includes('cantina') ||
      place.name.toLowerCase().includes('taco') ||
      place.name.toLowerCase().includes('burrito') ||
      place.placeTypes.some(type => type.includes('mexican'))
    )

    const finalPlaces = mexicanPlaces.length > 0 ? mexicanPlaces : placesWithDistance.slice(0, 12)

    // Sort by rating and distance
    const sortedPlaces = finalPlaces
      .filter(place => place.businessStatus !== 'CLOSED_PERMANENTLY')
      .sort((a, b) => {
        const ratingDiff = (b.rating || 0) - (a.rating || 0)
        if (Math.abs(ratingDiff) > 0.3) return ratingDiff
        return (a.distance || 0) - (b.distance || 0)
      })
      .slice(0, 12)

    console.log(`Returning ${sortedPlaces.length} places`)
    
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