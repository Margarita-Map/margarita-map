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
    const { latitude, longitude, radius = 8000, restaurantName } = await req.json()
    
    console.log(`Searching for ${restaurantName ? `"${restaurantName}" restaurants` : 'Mexican restaurants'} near ${latitude}, ${longitude} within ${radius}m`)
    
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    console.log('=== API KEY DEBUGGING ===')
    console.log('API Key status:', apiKey ? 'Found' : 'Missing')
    console.log('API Key length:', apiKey?.length || 0)
    console.log('API Key first 10 chars:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A')
    console.log('API Key last 5 chars:', apiKey ? '...' + apiKey.substring(apiKey.length - 5) : 'N/A')
    
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not found in environment variables')
      return getFallbackPlaces(latitude, longitude)
    }
    
    // Test a simple geocoding API call first to verify the key works
    if (apiKey) {
      const testGeoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey.trim()}`
      console.log('Testing API key with geocoding...')
      console.log('Test URL (without key):', testGeoUrl.replace(apiKey.trim(), '[HIDDEN]'))
      
      try {
        const geoResponse = await fetch(testGeoUrl)
        const geoData = await geoResponse.json()
        console.log('Geocoding test status:', geoData.status)
        console.log('Geocoding response details:', JSON.stringify(geoData, null, 2))
        
        if (geoData.status === 'REQUEST_DENIED') {
          console.error('API key denied. Full error details:')
          console.error('Status:', geoData.status)
          console.error('Error message:', geoData.error_message || 'No specific error message')
          console.error('Available results:', geoData.results ? geoData.results.length : 'undefined')
          return getFallbackPlaces(latitude, longitude)
        }
        
        if (geoData.status === 'OK') {
          console.log('✅ API key is working! Proceeding with Places API...')
        }
      } catch (testError) {
        console.error('API key test failed:', testError)
        return getFallbackPlaces(latitude, longitude)
      }
    }
    
    if (!apiKey) {
      console.error('Google Maps API key not configured - using fallback data')
      return getFallbackPlaces(latitude, longitude)
    }

    // Build search queries based on whether we're searching for a specific restaurant
    let searchQueries: string[]
    
    if (restaurantName) {
      // Search for specific restaurant name with restaurant-focused queries
      const baseSearches = [
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=restaurant&keyword=${encodeURIComponent(restaurantName)}&key=${apiKey}`,
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=food&keyword=${encodeURIComponent(restaurantName)}&key=${apiKey}`,
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=meal_takeaway&keyword=${encodeURIComponent(restaurantName)}&key=${apiKey}`,
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${encodeURIComponent(restaurantName + ' restaurant')}&key=${apiKey}`
      ]
      
      // Add broader chain searches with larger radius for multiple locations
      const chainSearches = [
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius * 2}&type=restaurant&keyword=${encodeURIComponent(restaurantName)}&key=${apiKey}`,
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(restaurantName + ' restaurant')}&location=${latitude},${longitude}&radius=${radius * 3}&type=restaurant&key=${apiKey}`
      ]
      
      searchQueries = [...baseSearches, ...chainSearches]
      console.log(`Searching for "${restaurantName}" restaurants including chain locations with expanded radius...`)
    } else {
      // Search for Mexican restaurants, margarita bars, and tequila bars
      searchQueries = [
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=mexican+restaurant&key=${apiKey}`,
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=margarita+bar&key=${apiKey}`,
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=tequila+bar&key=${apiKey}`,
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=restaurant&keyword=mexican&key=${apiKey}`
      ]
      console.log('Searching for Mexican restaurants, margarita bars, and tequila bars...')
    }
    
    try {
      // Execute all search queries in parallel
      const searchPromises = searchQueries.map(url => fetch(url).then(res => res.json()))
      const searchResults = await Promise.all(searchPromises)
      
      console.log('Executed', searchQueries.length, 'search queries')
      
      // Combine all results
      let allPlaces: any[] = []
      
      searchResults.forEach((data, index) => {
        console.log(`Search ${index + 1} status:`, data.status, 'Results:', data.results?.length || 0)
        
        if (data.status === 'OK' && data.results) {
          allPlaces = allPlaces.concat(data.results)
        }
      })
      
      // Remove duplicates based on place_id
      const uniquePlaces = allPlaces.filter((place, index, self) => 
        index === self.findIndex(p => p.place_id === place.place_id)
      )
      
      console.log(`Found ${allPlaces.length} total results, ${uniquePlaces.length} unique places`)
      
      if (uniquePlaces.length === 0) {
        console.log('No Mexican restaurants, margarita bars, or tequila bars found - using fallback')
        return getFallbackPlaces(latitude, longitude)
      }
      
      // Filter out non-food businesses when searching for specific restaurants
      let filteredPlaces = uniquePlaces
      if (restaurantName) {
        filteredPlaces = uniquePlaces.filter((place: any) => {
          const types = place.types || []
          const isFood = types.some((type: string) => 
            ['restaurant', 'food', 'meal_takeaway', 'meal_delivery', 'cafe'].includes(type)
          )
          const isNotLawyer = !types.includes('lawyer')
          const isNotContractor = !types.includes('general_contractor') && !types.includes('roofing_contractor')
          const isNotRealEstate = !types.includes('real_estate_agency')
          
          console.log(`Place: ${place.name}, Types: ${types.join(', ')}, IsFood: ${isFood}, Keeping: ${isFood && isNotLawyer && isNotContractor && isNotRealEstate}`)
          
          return isFood && isNotLawyer && isNotContractor && isNotRealEstate
        })
        console.log(`Filtered from ${uniquePlaces.length} to ${filteredPlaces.length} food-related businesses`)
      }
      
      if (filteredPlaces.length === 0) {
        console.log('No restaurants found after filtering - using fallback')
        return getFallbackPlaces(latitude, longitude)
      }

      // Process the filtered places
      const places = filteredPlaces.slice(0, 15).map((place: any) => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address || 'Address not available',
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

      // Enhanced sorting for restaurant searches
      const sortedPlaces = placesWithDistance
        .filter(place => place.businessStatus !== 'CLOSED_PERMANENTLY')
        .sort((a, b) => {
          if (restaurantName) {
            // When searching for specific restaurant, prioritize exact name matches
            const aNameMatch = a.name.toLowerCase().includes(restaurantName.toLowerCase())
            const bNameMatch = b.name.toLowerCase().includes(restaurantName.toLowerCase())
            
            if (aNameMatch && !bNameMatch) return -1
            if (!aNameMatch && bNameMatch) return 1
            
            // Then sort by distance for same-name restaurants
            return (a.distance || 0) - (b.distance || 0)
          } else {
            // For general searches, sort by rating then distance
            const ratingDiff = (b.rating || 0) - (a.rating || 0)
            if (Math.abs(ratingDiff) > 0.3) return ratingDiff
            return (a.distance || 0) - (b.distance || 0)
          }
        })

      console.log(`Returning ${sortedPlaces.length} Mexican restaurants, margarita bars, and tequila bars from Google`)
      
      return new Response(
        JSON.stringify({ places: sortedPlaces, source: 'google' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
      
    } catch (apiError) {
      console.error('Google Places API call failed:', apiError)
      return getFallbackPlaces(latitude, longitude)
    }

    console.log('No results from Google Places API - using fallback')
    return getFallbackPlaces(latitude, longitude)

  } catch (error) {
    console.error('Error in edge function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function getFallbackPlaces(latitude: number, longitude: number) {
  console.log('Generating fallback places near user location')
  
  const mexicanPlaces = [
    'El Corazón Tequileria',
    'Casa Margarita',
    'Agave Azul Mexican Cantina',
    'Tequila Sunrise Bar & Grill',
    'Los Amigos Mexican Kitchen',
    'Mezcal & Co.',
    'La Cantina Mexicana',
    'Patrón Palace'
  ]
  
  const fallbackPlaces = mexicanPlaces.map((name, index) => {
    // Generate coordinates within 2-5 miles of user location
    const offsetLat = (Math.random() - 0.5) * 0.08
    const offsetLng = (Math.random() - 0.5) * 0.08
    const lat = latitude + offsetLat
    const lng = longitude + offsetLng
    
    const distance = calculateDistance(latitude, longitude, lat, lng)
    
    return {
      id: `fallback-${index}`,
      name: name,
      address: `Local Mexican Restaurant • ${distance.toFixed(1)} miles away`,
      location: { lat, lng },
      rating: 4.2 + Math.random() * 0.7,
      priceLevel: Math.floor(Math.random() * 3) + 2,
      photos: [],
      placeTypes: ['restaurant', 'mexican'],
      businessStatus: 'OPERATIONAL',
      distance: distance
    }
  })
  
  const sortedFallback = fallbackPlaces.sort((a, b) => a.distance - b.distance)
  
  return new Response(
    JSON.stringify({ 
      places: sortedFallback, 
      source: 'fallback',
      message: 'Showing sample Mexican restaurants - Google Places API may need configuration',
      debug: {
        apiKeyFound: !!Deno.env.get('GOOGLE_MAPS_API_KEY'),
        apiKeyLength: Deno.env.get('GOOGLE_MAPS_API_KEY')?.length || 0,
        timestamp: new Date().toISOString()
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    },
  )
}

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