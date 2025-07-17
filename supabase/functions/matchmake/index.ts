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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }
    
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

    // D'abord, nettoyer les parties en attente trop anciennes (plus de 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await supabase
      .from('games')
      .update({ status: 'abandoned' })
      .eq('status', 'waitingForPlayers')
      .lt('created_at', fiveMinutesAgo);

    // Rechercher une partie disponible avec MMR proche (+/- 200 points)
    const mmrRange = 200;
    const userMmr = profile.mmr || 1000;
    
    let { data: availableGames, error: searchError } = await supabase
      .from('games')
      .select(`
        *,
        player_a_profile:profiles!player_a(mmr)
      `)
      .eq('status', 'waitingForPlayers')
      .eq('mode', mode)
      .is('player_b', null)
      .neq('player_a', user.id)
      .gte('player_a_profile.mmr', userMmr - mmrRange)
      .lte('player_a_profile.mmr', userMmr + mmrRange)
      .order('created_at', { ascending: true })
      .limit(1);

    if (searchError) {
      console.error('Search error:', searchError);
      throw searchError;
    }

    // Si aucune partie trouvée dans la fourchette MMR, essayer avec une fourchette plus large
    if ((!availableGames || availableGames.length === 0) && mode === 'quick') {
      const widerMmrRange = 500;
      const { data: widerSearch } = await supabase
        .from('games')
        .select(`
          *,
          player_a_profile:profiles!player_a(mmr)
        `)
        .eq('status', 'waitingForPlayers')
        .eq('mode', mode)
        .is('player_b', null)
        .neq('player_a', user.id)
        .gte('player_a_profile.mmr', userMmr - widerMmrRange)
        .lte('player_a_profile.mmr', userMmr + widerMmrRange)
        .order('created_at', { ascending: true })
        .limit(1);
        
      if (widerSearch && widerSearch.length > 0) {
        availableGames = widerSearch;
      }
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