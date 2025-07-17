// supabase/functions/make-move/index.ts
interface MakeMoveRequest {
  gameId: string;
  action: 'pass' | 'shot' | 'dribble';
  actorPosition: string;
  targetPosition?: string;
  bonusCards?: string[];
}

serve(async (req) => {
  try {
    const request = await req.json() as MakeMoveRequest;
    const supabase = createAuthenticatedClient(req);
    
    // Authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    // Récupérer et vérifier l'état du jeu
    const { data: game } = await supabase
      .from('games')
      .select('*')
      .eq('id', request.gameId)
      .single();

    if (!game) {
      return new Response(JSON.stringify({ error: 'Partie introuvable' }), { 
        status: 404 
      });
    }

    // Vérifications
    if (!isPlayerInGame(user.id, game)) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), { 
        status: 403 
      });
    }

    if (!isPlayerTurn(user.id, game)) {
      return new Response(JSON.stringify({ error: 'Pas votre tour' }), { 
        status: 400 
      });
    }

    if (!isValidGameState(game)) {
      return new Response(JSON.stringify({ error: 'État de jeu invalide' }), { 
        status: 400 
      });
    }

    // Valider l'action
    const validation = await validateAction(supabase, game, request);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), { 
        status: 400 
      });
    }

    // Résoudre l'action
    const result = await resolveAction(supabase, game, request, user.id);

    // Mettre à jour l'état du jeu
    const newState = updateGameState(game, result);
    
    const { error: updateError } = await supabase
      .from('games')
      .update({
        game_state: newState.gameState,
        current_turn: newState.currentTurn,
        score_a: newState.scoreA,
        score_b: newState.scoreB,
        current_player: newState.currentPlayer,
        ball_position: newState.ballPosition,
        turn_started_at: new Date()
      })
      .eq('id', game.id);

    if (updateError) throw updateError;

    // Enregistrer le move
    const move = await saveMoveToHistory(supabase, {
      gameId: game.id,
      playerId: user.id,
      ...request,
      ...result
    });

    // Distribuer l'XP
    await distributeXP(supabase, game.id, result.xpGains);

    // Vérifier fin de partie
    if (newState.currentTurn > 10) {
      await endGame(supabase, game.id);
    }

    return new Response(JSON.stringify({ 
      move,
      gameState: newState
    }), { status: 200 });

  } catch (error) {
    return errorResponse(error);
  }
});

async function resolveAction(
  supabase: any, 
  game: any, 
  request: MakeMoveRequest,
  playerId: string
) {
  // 1. Roll initial (1-6)
  const initialRoll = Math.floor(Math.random() * 6) + 1;
  
  // 2. Vérifier si critique ou échec
  if (initialRoll === 1) {
    return {
      success: false,
      critical: false,
      initialRoll,
      result: 'échec',
      xpGains: {}
    };
  }
  
  if (initialRoll === 6) {
    return {
      success: true,
      critical: true,
      initialRoll,
      result: 'critique',
      xpGains: calculateCriticalXP(request.action)
    };
  }
  
  // 3. Résoudre le duel (2-5)
  const duelResult = await resolveDuel(supabase, game, request, initialRoll);
  
  return {
    ...duelResult,
    initialRoll,
    xpGains: calculateDuelXP(duelResult, request.action)
  };
}

async function resolveDuel(
  supabase: any,
  game: any,
  request: MakeMoveRequest,
  initialRoll: number
) {
  // Récupérer les cartes impliquées
  const actor = await getCardAtPosition(supabase, game.id, request.actorPosition);
  const defender = await getDefenderCard(supabase, game, request);
  
  // Calculer les totaux avec mods
  const actorTotal = calculateTotal(actor, request.action, 'attack', {
    baseRoll: Math.floor(Math.random() * 6) + 1,
    bonusCards: request.bonusCards
  });
  
  const defenderTotal = calculateTotal(defender, request.action, 'defense', {
    baseRoll: Math.floor(Math.random() * 6) + 1
  });
  
  const success = actorTotal > defenderTotal;
  
  return {
    success,
    actorRoll: actorTotal.roll,
    defenderRoll: defenderTotal.roll,
    actorTotal: actorTotal.total,
    defenderTotal: defenderTotal.total,
    modifiers: {
      actor: actorTotal.modifiers,
      defender: defenderTotal.modifiers
    }
  };
}

function calculateTotal(
  card: any,
  action: string,
  side: 'attack' | 'defense',
  options: any
) {
  let total = options.baseRoll;
  const modifiers = [];
  
  // Ajouter stat appropriée
  const stat = getStatForAction(card, action, side);
  total += stat;
  modifiers.push({ type: 'stat', value: stat });
  
  // Ajouter bonus rareté
  const rarityBonus = getRarityBonus(card.rarity);
  total += rarityBonus;
  if (rarityBonus > 0) {
    modifiers.push({ type: 'rarity', value: rarityBonus });
  }
  
  
  // Ajouter bonus cartes
  if (options.bonusCards) {
    const cardBonus = calculateBonusCardEffect(options.bonusCards);
    total += cardBonus;
    if (cardBonus > 0) {
      modifiers.push({ type: 'bonusCard', value: cardBonus });
    }
  }
  
  // Cap à 6
  if (total > 6) total = 6;
  
  return {
    roll: options.baseRoll,
    total,
    modifiers
  };
}