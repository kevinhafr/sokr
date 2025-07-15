# Rocket Footy - API Routes & Edge Functions (Partie 1)

## Vue d'ensemble des Edge Functions

Les Edge Functions sont déployées sur Supabase et gèrent toute la logique serveur critique.

```
supabase/functions/
├── create-game/
├── join-game/
├── matchmake/
├── make-move/
├── place-card/
├── handle-timeout/
├── coin-toss/
├── validate-deck/
├── open-pack/
└── admin/
```

## 1. Create Game Function

```typescript
// supabase/functions/create-game/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

interface CreateGameRequest {
  mode: 'quick' | 'draft' | 'friendly';
  deckId?: string;
  inviteCode?: string;
}

interface CreateGameResponse {
  game: any;
  inviteCode?: string;
  error?: string;
}

serve(async (req) => {
  try {
    const { mode, deckId, inviteCode } = await req.json() as CreateGameRequest;
    
    // Authentification
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Vérifier l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), { 
        status: 401 
      });
    }

    // Vérifier les bans
    const { data: profile } = await supabase
      .from('profiles')
      .select('ban_until, mmr')
      .eq('id', user.id)
      .single();

    if (profile?.ban_until && new Date(profile.ban_until) > new Date()) {
      return new Response(JSON.stringify({ 
        error: 'Joueur banni',
        until: profile.ban_until 
      }), { status: 403 });
    }

    // Créer la partie
    const gameData = {
      mode,
      status: mode === 'friendly' ? 'waitingForPlayers' : 'initializing',
      player_a: user.id,
      created_by: user.id,
      game_state: initializeGameState(),
      current_turn: 0
    };

    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert(gameData)
      .select()
      .single();

    if (gameError) throw gameError;

    // Traiter selon le mode
    if (mode === 'quick') {
      await setupQuickGame(supabase, user.id, game.id);
    } else if (mode === 'draft' && deckId) {
      await setupDraftGame(supabase, user.id, game.id, deckId);
    } else if (mode === 'friendly') {
      const code = await setupFriendlyGame(supabase, game.id);
      return new Response(JSON.stringify({ game, inviteCode: code }), { 
        status: 200 
      });
    }

    return new Response(JSON.stringify({ game }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500 
    });
  }
});

// Helpers
function initializeGameState() {
  return {
    boardState: {},
    ballPosition: 'Z2-2',
    turn: 0,
    placementCount: {},
    bonusCardsUsed: { a: [], b: [] }
  };
}

async function setupQuickGame(supabase: any, userId: string, gameId: string) {
  // Sélectionner 8 cartes Common aléatoires
  const deck = await selectRandomCommonDeck(supabase);
  
  // Distribuer 1 carte bonus aléatoire pour TOUT LE MATCH
  const bonusCard = await selectRandomBonusCard(supabase);
  
  // Enregistrer le deck et la carte bonus unique
  await supabase.from('game_decks').insert({
    game_id: gameId,
    player_id: userId,
    cards: deck.map(c => c.id),
    bonus_card: bonusCard.id // Une seule carte bonus
  });
}

async function selectRandomCommonDeck(supabase: any) {
  const deck = [];
  
  // 2 gardiens
  const goalkeepers = await supabase
    .from('players')
    .select('*')
    .eq('position', 'gardien')
    .eq('rarity', 'Common')
    .order('random()')
    .limit(2);
  deck.push(...goalkeepers.data);
  
  // 2-3 pour chaque position
  for (const position of ['defenseur', 'milieu', 'attaquant']) {
    const count = Math.floor(Math.random() * 2) + 2; // 2 ou 3
    const players = await supabase
      .from('players')
      .select('*')
      .eq('position', position)
      .eq('rarity', 'Common')
      .order('random()')
      .limit(count);
    deck.push(...players.data);
  }
  
  // Ajuster pour avoir exactement 8
  while (deck.length > 8) deck.pop();
  while (deck.length < 8) {
    const extra = await supabase
      .from('players')
      .select('*')
      .eq('rarity', 'Common')
      .neq('position', 'gardien')
      .order('random()')
      .limit(1);
    deck.push(extra.data[0]);
  }
  
  return deck;
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
```

## 2. Matchmaking Function

```typescript
// supabase/functions/matchmake/index.ts
interface MatchmakeRequest {
  mode: 'quick' | 'draft';
  deckId?: string;
}

serve(async (req) => {
  try {
    const { mode, deckId } = await req.json() as MatchmakeRequest;
    const supabase = createAuthenticatedClient(req);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    // Récupérer le profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('mmr, ban_until')
      .eq('id', user.id)
      .single();

    // Vérifier les bans
    if (isBanned(profile)) {
      return bannedResponse(profile.ban_until);
    }

    // Rechercher une partie disponible
    const mmrRange = 100;
    const { data: availableGames } = await supabase
      .from('games')
      .select(`
        *,
        player_a_profile:profiles!player_a(mmr)
      `)
      .eq('status', 'waitingForPlayers')
      .eq('mode', mode)
      .is('player_b', null)
      .gte('player_a_profile.mmr', profile.mmr - mmrRange)
      .lte('player_a_profile.mmr', profile.mmr + mmrRange)
      .order('created_at', { ascending: true })
      .limit(1);

    if (availableGames?.length > 0) {
      return await joinExistingGame(supabase, user.id, availableGames[0]);
    }

    // Créer nouvelle partie
    return await createNewMatchmakingGame(supabase, user.id, mode, deckId);

  } catch (error) {
    return errorResponse(error);
  }
});

async function joinExistingGame(supabase: any, userId: string, game: any) {
  // Rejoindre avec vérification atomique
  const { data: updatedGame, error } = await supabase
    .from('games')
    .update({
      player_b: userId,
      status: 'coinToss',
      updated_at: new Date()
    })
    .eq('id', game.id)
    .is('player_b', null)
    .select()
    .single();

  if (error) throw error;

  // Lancer le coin toss
  await supabase.functions.invoke('coin-toss', {
    body: { gameId: game.id }
  });

  return new Response(JSON.stringify({ 
    game: updatedGame,
    action: 'joined'
  }), { status: 200 });
}

async function createNewMatchmakingGame(
  supabase: any, 
  userId: string, 
  mode: string,
  deckId?: string
) {
  const { data: game } = await supabase
    .from('games')
    .insert({
      mode,
      status: 'waitingForPlayers',
      player_a: userId,
      game_state: initializeGameState()
    })
    .select()
    .single();

  // Gérer le deck pour mode draft
  if (mode === 'draft' && deckId) {
    await setupDraftDeck(supabase, userId, game.id, deckId);
  }

  // Timeout de 45s pour matchmaking
  scheduleMatchmakingTimeout(supabase, game.id, userId);

  return new Response(JSON.stringify({ 
    game,
    action: 'created',
    timeout: 45
  }), { status: 200 });
}

function scheduleMatchmakingTimeout(supabase: any, gameId: string, userId: string) {
  setTimeout(async () => {
    const { data: game } = await supabase
      .from('games')
      .select('status')
      .eq('id', gameId)
      .single();

    if (game?.status === 'waitingForPlayers') {
      // Annuler et créer partie contre IA
      await supabase
        .from('games')
        .update({ 
          status: 'cancelled',
          cancelled_reason: 'matchmaking_timeout' 
        })
        .eq('id', gameId);

      // Créer partie IA
      await createAIGame(supabase, userId);
    }
  }, 45000);
}
```

## 3. Make Move Function

```typescript
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
    bonusCards: request.bonusCards,
    formation: getFormationBonus(game, 'attack')
  });
  
  const defenderTotal = calculateTotal(defender, request.action, 'defense', {
    baseRoll: Math.floor(Math.random() * 6) + 1,
    formation: getFormationBonus(game, 'defense')
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
  
  // Ajouter bonus formation
  if (options.formation) {
    total += options.formation;
    modifiers.push({ type: 'formation', value: options.formation });
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
```

## 4. Place Card Function

```typescript
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
```

## 5. Coin Toss Function

```typescript
// supabase/functions/coin-toss/index.ts
interface CoinTossRequest {
  gameId: string;
}

serve(async (req) => {
  try {
    const { gameId } = await req.json() as CoinTossRequest;
    const supabase = createServiceClient(); // Client service pour actions système
    
    // Récupérer le jeu
    const { data: game } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (game.status !== 'coinToss') {
      return new Response(JSON.stringify({ 
        error: 'État de jeu invalide pour coin toss' 
      }), { status: 400 });
    }

    // Effectuer le tirage
    const winner = Math.random() < 0.5 ? game.player_a : game.player_b;
    const loser = winner === game.player_a ? game.player_b : game.player_a;

    // Mettre à jour
    const { error } = await supabase
      .from('games')
      .update({
        coin_toss_winner: winner,
        first_placement_player: winner,
        current_player: winner,
        status: 'placement',
        game_state: {
          ...game.game_state,
          coinTossResult: {
            winner,
            timestamp: new Date()
          }
        }
      })
      .eq('id', gameId);

    if (error) throw error;

    // Notifier via Realtime
    await supabase
      .from('game_events')
      .insert({
        game_id: gameId,
        type: 'COIN_TOSS_COMPLETE',
        data: { winner, loser }
      });

    return new Response(JSON.stringify({ 
      winner,
      firstPlacer: winner
    }), { status: 200 });

  } catch (error) {
    return errorResponse(error);
  }
});
```