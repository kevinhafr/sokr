import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

interface MatchmakeRequest {
  mode: 'quick' | 'draft' | 'friendly';
  deckId?: string;
  cardIds?: string[];
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { mode, deckId, cardIds } = await req.json() as MatchmakeRequest;
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with the user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'http://127.0.0.1:54321';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
      },
    });
    
    // Get the user from the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('User authenticated:', user.id);

    // Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('mmr, ban_until')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Vérifier les bans
    if (profile.ban_until && new Date(profile.ban_until) > new Date()) {
      return new Response(
        JSON.stringify({ 
          error: 'User is banned',
          ban_until: profile.ban_until 
        }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Pour le mode friendly, créer directement une partie
    if (mode === 'friendly') {
      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert({
          player_a: user.id,
          status: 'waitingForPlayers',
          mode,
          current_player: user.id,
        })
        .select()
        .single();

      if (gameError) {
        console.error('Game creation error:', gameError);
        throw gameError;
      }

      return new Response(
        JSON.stringify({ 
          action: 'created',
          game 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Rechercher une partie disponible pour quick/draft
    const { data: availableGames, error: searchError } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'waitingForPlayers')
      .eq('mode', mode)
      .is('player_b', null)
      .neq('player_a', user.id)
      .order('created_at', { ascending: true })
      .limit(1);

    if (searchError) {
      console.error('Search error:', searchError);
      throw searchError;
    }

    if (availableGames && availableGames.length > 0) {
      // Rejoindre la partie existante
      const gameToJoin = availableGames[0];
      
      const { data: updatedGame, error: updateError } = await supabase
        .from('games')
        .update({
          player_b: user.id,
          status: 'coinToss',
          deck_b: deckId,
        })
        .eq('id', gameToJoin.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      return new Response(
        JSON.stringify({ 
          action: 'joined',
          game: updatedGame 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Créer une nouvelle partie
    const { data: newGame, error: createError } = await supabase
      .from('games')
      .insert({
        player_a: user.id,
        status: 'waitingForPlayers',
        mode,
        current_player: user.id,
        deck_a: deckId,
      })
      .select()
      .single();

    if (createError) {
      console.error('Create error:', createError);
      throw createError;
    }

    return new Response(
      JSON.stringify({ 
        action: 'created',
        game: newGame 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Matchmaking error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});