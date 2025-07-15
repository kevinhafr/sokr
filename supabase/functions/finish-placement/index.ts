import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

interface FinishPlacementRequest {
  gameId: string;
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { gameId } = await req.json() as FinishPlacementRequest;
    
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

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'http://127.0.0.1:54321';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Use service role key for this operation
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the token to get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return new Response(
        JSON.stringify({ error: 'Game not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify user is part of the game
    if (game.player_a !== user.id && game.player_b !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Not authorized for this game' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify game is in placement phase
    if (game.status !== 'placement') {
      return new Response(
        JSON.stringify({ error: 'Game is not in placement phase' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if both players have placed their cards
    const boardState = game.board_state || {};
    let playerACards = 0;
    let playerBCards = 0;

    Object.values(boardState).forEach((cell: any) => {
      if (cell && cell.player === game.player_a) playerACards++;
      if (cell && cell.player === game.player_b) playerBCards++;
    });

    // Check if current player has placed enough cards (7 cards minimum)
    const currentPlayerCards = user.id === game.player_a ? playerACards : playerBCards;
    if (currentPlayerCards < 7) {
      return new Response(
        JSON.stringify({ 
          error: 'Not enough cards placed',
          required: 7,
          placed: currentPlayerCards 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Mark that this player has finished placement
    const placementComplete = game.game_state?.placementComplete || {};
    placementComplete[user.id] = true;

    // Check if both players have finished placement
    const bothPlayersReady = placementComplete[game.player_a] && placementComplete[game.player_b];

    // Update game state
    const updates: any = {
      game_state: {
        ...game.game_state,
        placementComplete
      }
    };

    // If both players are ready, start the game
    if (bothPlayersReady) {
      updates.status = 'active';
      updates.current_turn = 1;
      updates.turn_started_at = new Date().toISOString();
      // The current_player should already be set from coin toss
    }

    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update(updates)
      .eq('id', gameId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        game: updatedGame,
        ready: bothPlayersReady,
        message: bothPlayersReady ? 'Game started!' : 'Waiting for opponent to finish placement'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Finish placement error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});