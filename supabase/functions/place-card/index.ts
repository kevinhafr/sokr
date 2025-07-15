// supabase/functions/place-card/index.ts
interface PlaceCardRequest {
  gameId: string;
  cardId: string;
  position: string;
  isSubstitute?: boolean;
}

serve(async (req) => {
  try {
    const request = await req.json() as PlaceCardRequest;
    const supabase = createAuthenticatedClient(req);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    // Récupérer le jeu
    const { data: game } = await supabase
      .from('games')
      .select('*')
      .eq('id', request.gameId)
      .single();

    // Vérifications
    if (!isValidPlacement(game, user.id, request)) {
      return new Response(JSON.stringify({ 
        error: 'Placement invalide' 
      }), { status: 400 });
    }

    // Vérifier contraintes de placement
    const constraints = await checkPlacementConstraints(
      supabase, 
      game, 
      request
    );
    
    if (!constraints.valid) {
      return new Response(JSON.stringify({ 
        error: constraints.error 
      }), { status: 400 });
    }

    // Effectuer le placement
    const { data: placement } = await supabase
      .from('placements')
      .insert({
        game_id: request.gameId,
        player_id: user.id,
        card_id: request.cardId,
        position: request.position,
        placement_order: getPlacementOrder(game),
        is_substitute: request.isSubstitute || false
      })
      .select()
      .single();

    // Mettre à jour l'état du jeu
    const newState = updatePlacementState(game, placement);
    
    await supabase
      .from('games')
      .update({
        game_state: newState,
        current_player: getNextPlacer(game, user.id)
      })
      .eq('id', game.id);

    return new Response(JSON.stringify({ 
      placement,
      nextPlayer: getNextPlacer(game, user.id)
    }), { status: 200 });

  } catch (error) {
    return errorResponse(error);
  }
});

async function checkPlacementConstraints(
  supabase: any,
  game: any,
  request: PlaceCardRequest
) {
  // Vérifier position disponible
  const existing = await supabase
    .from('placements')
    .select('id')
    .eq('game_id', request.gameId)
    .eq('position', request.position)
    .single();

  if (existing.data) {
    return { valid: false, error: 'Position déjà occupée' };
  }

  // Vérifier contrainte 3 cartes par zone
  const zone = request.position.substring(0, 2);
  const { count } = await supabase
    .from('placements')
    .select('id', { count: 'exact' })
    .eq('game_id', request.gameId)
    .like('position', `${zone}%`);

  if (count >= 3) {
    return { valid: false, error: 'Zone pleine (max 3)' };
  }

  // Vérifier contrainte CP
  const { data: card } = await supabase
    .from('players')
    .select('cp_cost')
    .eq('id', request.cardId)
    .single();

  const { data: teamCards } = await supabase
    .from('placements')
    .select('card:players(cp_cost)')
    .eq('game_id', request.gameId)
    .eq('player_id', game.current_player);

  const totalCP = teamCards.reduce((sum, p) => sum + p.card.cp_cost, 0) + card.cp_cost;
  
  if (totalCP > 20) {
    return { valid: false, error: 'Limite CP dépassée (max 20)' };
  }

  // Vérifier première carte = milieu
  const placementCount = getPlayerPlacementCount(game, game.current_player);
  if (placementCount === 0) {
    const { data: cardData } = await supabase
      .from('players')
      .select('position')
      .eq('id', request.cardId)
      .single();

    if (cardData.position !== 'milieu') {
      return { valid: false, error: 'Première carte doit être un milieu' };
    }
  }

  return { valid: true };
}