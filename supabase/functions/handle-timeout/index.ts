// supabase/functions/handle-timeout/index.ts
interface HandleTimeoutRequest {
  gameId: string;
  timeoutType: 'turn' | 'placement' | 'matchmaking';
}

serve(async (req) => {
  try {
    const { gameId, timeoutType } = await req.json() as HandleTimeoutRequest;
    const supabase = createServiceClient();
    
    // Récupérer le jeu
    const { data: game } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (!game) {
      return new Response(JSON.stringify({ error: 'Partie introuvable' }), { 
        status: 404 
      });
    }

    // Gérer selon le type de timeout
    switch (timeoutType) {
      case 'turn':
        await handleTurnTimeout(supabase, game);
        break;
      case 'placement':
        await handlePlacementTimeout(supabase, game);
        break;
      case 'matchmaking':
        await handleMatchmakingTimeout(supabase, game);
        break;
      default:
        throw new Error('Type de timeout invalide');
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    return errorResponse(error);
  }
});

async function handleTurnTimeout(supabase: any, game: any) {
  const currentPlayer = game.current_player;
  
  // Action automatique (passe aléatoire)
  const autoAction = await generateAutoAction(supabase, game, currentPlayer);
  
  // Enregistrer le move avec pénalité
  await supabase.from('moves').insert({
    game_id: game.id,
    player_id: currentPlayer,
    action_type: autoAction.type,
    ...autoAction,
    timeout: true,
    penalty: true
  });
  
  // Incrémenter les timeouts du joueur
  await incrementPlayerTimeouts(supabase, currentPlayer);
  
  // Passer au tour suivant
  const nextPlayer = getNextPlayer(game);
  await supabase
    .from('games')
    .update({
      current_player: nextPlayer,
      current_turn: game.current_turn + 1,
      turn_started_at: new Date()
    })
    .eq('id', game.id);
}

async function handlePlacementTimeout(supabase: any, game: any) {
  const currentPlayer = game.current_player;
  
  // Placement automatique
  const autoPlacement = await generateAutoPlacement(supabase, game, currentPlayer);
  
  await supabase.from('placements').insert({
    game_id: game.id,
    player_id: currentPlayer,
    ...autoPlacement,
    auto_placed: true
  });
  
  // Passer au joueur suivant
  const nextPlayer = getNextPlacer(game, currentPlayer);
  await supabase
    .from('games')
    .update({
      current_player: nextPlayer,
      game_state: updatePlacementCount(game.game_state, currentPlayer)
    })
    .eq('id', game.id);
}

async function incrementPlayerTimeouts(supabase: any, playerId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('consecutive_abandons')
    .eq('id', playerId)
    .single();
  
  const newCount = (profile.consecutive_abandons || 0) + 1;
  
  // Appliquer sanctions si nécessaire
  let banUntil = null;
  if (newCount >= 10) {
    banUntil = new Date(Date.now() + 60 * 60 * 1000); // 1h
  } else if (newCount >= 100) {
    banUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  }
  
  await supabase
    .from('profiles')
    .update({
      consecutive_abandons: newCount,
      last_abandon_at: new Date(),
      ban_until: banUntil
    })
    .eq('id', playerId);
}