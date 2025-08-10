import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting cleanup of expired parties...')

    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]
    
    // Delete party posts where the party date is before today
    const { data: deletedParties, error } = await supabase
      .from('party_posts')
      .delete()
      .lt('party_date', today)
      .select('id, title, party_date')

    if (error) {
      console.error('Error cleaning up expired parties:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to cleanup expired parties' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const deletedCount = deletedParties?.length || 0
    console.log(`Successfully deleted ${deletedCount} expired parties:`, deletedParties)

    // Also cleanup any party check-ins for deleted parties
    if (deletedCount > 0) {
      const deletedPartyIds = deletedParties.map(party => party.id)
      
      const { error: checkinError } = await supabase
        .from('party_checkins')
        .delete()
        .in('party_id', deletedPartyIds)

      if (checkinError) {
        console.error('Error cleaning up party check-ins:', checkinError)
      } else {
        console.log('Successfully cleaned up associated party check-ins')
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedCount,
        message: `Cleaned up ${deletedCount} expired parties`
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})