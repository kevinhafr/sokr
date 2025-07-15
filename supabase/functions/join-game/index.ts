import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createAuthenticatedClient, errorResponse, unauthorizedResponse } from '../shared/utils.ts'

interface JoinGameRequest {
  gameId?: string;
  inviteCode?: string;
}

serve(async (req) => {
  try {
    const { gameId, inviteCode } = await req.json() as JoinGameRequest;
    const supabase = createAuthenticatedClient(req);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    let game;
    
    if (inviteCode) {
      // Rejoindre par code d'invitation
      const { data } = await supabase
        .from('games')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();
      
      game = data;
    } else if (gameId) {
      // Rejoindre par ID
      const { data } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();
      
      game = data;
    }

    if (!game) {
      return new Response(JSON.stringify({ error: 'Partie introuvable' }), { 
        status: 404 
      });
    }

    // Vérifier l'état de la partie
    if (game.status !== 'waitingForPlayers') {
      return new Response(JSON.stringify({ error: 'Partie déjà commencée' }), { 
        status: 400 
      });
    }

    // Rejoindre la partie
    const { data: updatedGame } = await supabase
      .from('games')
      .update({
        player_b: user.id,
        status: 'coinToss'
      })
      .eq('id', game.id)
      .select()
      .single();

    // Lancer le coin toss
    await supabase.functions.invoke('coin-toss', {
      body: { gameId: game.id }
    });

    return new Response(JSON.stringify({ 
      game: updatedGame,
      action: 'joined' 
    }), { status: 200 });

  } catch (error) {
    return errorResponse(error);
  }
});