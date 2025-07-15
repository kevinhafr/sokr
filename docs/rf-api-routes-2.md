# Rocket Footy - API Routes & Edge Functions (Partie 2)

## 6. Handle Timeout Function

```typescript
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
```

## 7. Open Pack Function

```typescript
// supabase/functions/open-pack/index.ts
interface OpenPackRequest {
  packTypeId: string;
  purchaseId: string;
}

serve(async (req) => {
  try {
    const { packTypeId, purchaseId } = await req.json() as OpenPackRequest;
    const supabase = createAuthenticatedClient(req);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    // Vérifier la possession du pack
    const { data: purchase } = await supabase
      .from('purchases')
      .select('*, pack_type:pack_types(*)')
      .eq('id', purchaseId)
      .eq('user_id', user.id)
      .is('opened_at', null)
      .single();

    if (!purchase) {
      return new Response(JSON.stringify({ 
        error: 'Pack introuvable ou déjà ouvert' 
      }), { status: 404 });
    }

    // Récupérer les infos du joueur pour bonus
    const { data: spendingData } = await supabase
      .from('spending_tracker')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Générer les cartes selon les probabilités
    const cards = await generatePackCards(
      supabase,
      purchase.pack_type,
      spendingData?.bonus_multiplier || 1.0
    );

    // Attribuer les cartes au joueur
    for (const card of cards) {
      await supabase.from('user_players').insert({
        user_id: user.id,
        player_id: card.id,
        obtained_at: new Date()
      });
      
      // Décrémenter l'inventaire
      await supabase.rpc('decrement_card_inventory', {
        p_card_id: card.id,
        p_count: 1
      });
    }

    // Marquer le pack comme ouvert
    await supabase
      .from('purchases')
      .update({
        cards_received: cards.map(c => c.id),
        opened_at: new Date()
      })
      .eq('id', purchaseId);

    // Mettre à jour le tracker de dépenses
    await updateSpendingTracker(supabase, user.id);

    return new Response(JSON.stringify({ 
      cards,
      bonusApplied: spendingData?.bonus_multiplier > 1
    }), { status: 200 });

  } catch (error) {
    return errorResponse(error);
  }
});

async function generatePackCards(
  supabase: any,
  packType: any,
  bonusMultiplier: number
) {
  const cards = [];
  const probabilities = packType.probabilities;
  const guarantees = packType.guarantees || {};
  
  // Appliquer le bonus aux probabilités
  const adjustedProbs = adjustProbabilities(probabilities, bonusMultiplier);
  
  // Garantir les minimums
  for (const [rarity, minCount] of Object.entries(guarantees)) {
    for (let i = 0; i < minCount; i++) {
      const card = await selectRandomCard(supabase, rarity);
      cards.push(card);
    }
  }
  
  // Compléter avec des cartes aléatoires
  while (cards.length < packType.card_count) {
    const rarity = selectRarityByProbability(adjustedProbs);
    const card = await selectRandomCard(supabase, rarity);
    cards.push(card);
  }
  
  return cards;
}

function adjustProbabilities(
  baseProbabilities: any,
  multiplier: number
): any {
  const adjusted = { ...baseProbabilities };
  
  // Augmenter les chances des raretés élevées
  if (multiplier > 1) {
    const bonus = (multiplier - 1) * 0.1;
    adjusted.SuperRare = Math.min(adjusted.SuperRare * (1 + bonus), 0.05);
    adjusted.Unique = Math.min(adjusted.Unique * (1 + bonus), 0.01);
    adjusted.Rare = Math.min(adjusted.Rare * (1 + bonus), 0.15);
    
    // Réduire les Common en conséquence
    const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
    adjusted.Common = 1 - (total - adjusted.Common);
  }
  
  return adjusted;
}

async function selectRandomCard(supabase: any, rarity: string) {
  const { data: cards } = await supabase
    .from('players')
    .select('*')
    .eq('rarity', rarity)
    .gt('available_copies', 0)
    .order('random()')
    .limit(1);
  
  if (!cards || cards.length === 0) {
    throw new Error(`Aucune carte ${rarity} disponible`);
  }
  
  return cards[0];
}
```

## 8. Validate Deck Function

```typescript
// supabase/functions/validate-deck/index.ts
interface ValidateDeckRequest {
  cards: string[]; // IDs des cartes
  name?: string;
  save?: boolean;
}

serve(async (req) => {
  try {
    const { cards, name, save } = await req.json() as ValidateDeckRequest;
    const supabase = createAuthenticatedClient(req);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    // Vérifier la possession des cartes
    const { data: userCards } = await supabase
      .from('user_players')
      .select('player_id')
      .eq('user_id', user.id)
      .in('player_id', cards);

    if (userCards.length !== cards.length) {
      return new Response(JSON.stringify({ 
        error: 'Certaines cartes ne vous appartiennent pas' 
      }), { status: 400 });
    }

    // Récupérer les détails des cartes
    const { data: cardDetails } = await supabase
      .from('players')
      .select('*')
      .in('id', cards);

    // Valider les contraintes
    const validation = validateDeckConstraints(cardDetails);
    
    if (!validation.valid) {
      return new Response(JSON.stringify({ 
        error: validation.error,
        details: validation.details 
      }), { status: 400 });
    }

    // Sauvegarder si demandé
    if (save && name) {
      const { data: savedDeck } = await supabase
        .from('saved_decks')
        .insert({
          user_id: user.id,
          name,
          cards,
          total_cp: validation.totalCP,
          is_valid: true
        })
        .select()
        .single();

      return new Response(JSON.stringify({ 
        valid: true,
        deck: savedDeck
      }), { status: 200 });
    }

    return new Response(JSON.stringify({ 
      valid: true,
      totalCP: validation.totalCP,
      composition: validation.composition
    }), { status: 200 });

  } catch (error) {
    return errorResponse(error);
  }
});

function validateDeckConstraints(cards: any[]) {
  const result = {
    valid: true,
    error: '',
    details: {},
    totalCP: 0,
    composition: {}
  };

  // Vérifier le nombre de cartes (8)
  if (cards.length !== 8) {
    result.valid = false;
    result.error = 'Le deck doit contenir exactement 8 cartes';
    return result;
  }

  // Compter par position
  const positionCount = {};
  const rarityCount = {};
  let totalCP = 0;

  for (const card of cards) {
    // Compter les positions
    positionCount[card.position] = (positionCount[card.position] || 0) + 1;
    
    // Compter les raretés
    rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1;
    
    // Calculer CP total
    totalCP += card.cp_cost;
  }

  // Vérifier contraintes de position
  if (positionCount.gardien !== 1) {
    result.valid = false;
    result.error = 'Le deck doit contenir exactement 1 gardien';
    return result;
  }

  if ((positionCount.defenseur || 0) < 2) {
    result.valid = false;
    result.error = 'Le deck doit contenir au moins 2 défenseurs';
    return result;
  }

  if ((positionCount.milieu || 0) < 2) {
    result.valid = false;
    result.error = 'Le deck doit contenir au moins 2 milieux';
    return result;
  }

  if ((positionCount.attaquant || 0) < 2) {
    result.valid = false;
    result.error = 'Le deck doit contenir au moins 2 attaquants';
    return result;
  }

  // Vérifier contraintes de rareté
  if ((rarityCount.Unique || 0) > 1) {
    result.valid = false;
    result.error = 'Maximum 1 carte Unique par deck';
    return result;
  }

  if ((rarityCount.SuperRare || 0) > 2) {
    result.valid = false;
    result.error = 'Maximum 2 cartes Super Rare par deck';
    return result;
  }

  if ((rarityCount.Rare || 0) > 3) {
    result.valid = false;
    result.error = 'Maximum 3 cartes Rare par deck';
    return result;
  }

  // Vérifier contrainte CP (20 pour les 5 titulaires)
  // Note: On ne peut pas déterminer ici quels seront les titulaires
  // C'est vérifié lors du placement

  result.totalCP = totalCP;
  result.composition = {
    positions: positionCount,
    rarities: rarityCount
  };

  return result;
}
```

## 9. Admin Functions

### 9.1 Manage Cards

```typescript
// supabase/functions/admin/manage-cards/index.ts
interface ManageCardsRequest {
  action: 'create' | 'update' | 'delete' | 'adjust_inventory';
  cardData?: any;
  cardId?: string;
  inventoryAdjustment?: number;
}

serve(async (req) => {
  try {
    const request = await req.json() as ManageCardsRequest;
    const supabase = createAuthenticatedClient(req);
    
    // Vérifier les permissions admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), { 
        status: 403 
      });
    }

    // Exécuter l'action
    switch (request.action) {
      case 'create':
        return await createCard(supabase, request.cardData);
      case 'update':
        return await updateCard(supabase, request.cardId, request.cardData);
      case 'delete':
        return await deleteCard(supabase, request.cardId);
      case 'adjust_inventory':
        return await adjustInventory(
          supabase, 
          request.cardId, 
          request.inventoryAdjustment
        );
      default:
        return new Response(JSON.stringify({ error: 'Action invalide' }), { 
          status: 400 
        });
    }

  } catch (error) {
    return errorResponse(error);
  }
});

async function createCard(supabase: any, cardData: any) {
  // Valider les données
  if (!validateCardData(cardData)) {
    return new Response(JSON.stringify({ 
      error: 'Données de carte invalides' 
    }), { status: 400 });
  }

  // Créer la carte
  const { data: card, error } = await supabase
    .from('players')
    .insert(cardData)
    .select()
    .single();

  if (error) throw error;

  // Initialiser l'inventaire
  const initialCopies = getInitialCopies(cardData.rarity);
  await supabase
    .from('card_inventory')
    .insert({
      player_id: card.id,
      total_copies: initialCopies,
      available_copies: initialCopies
    });

  return new Response(JSON.stringify({ card }), { status: 201 });
}

function getInitialCopies(rarity: string): number {
  switch (rarity) {
    case 'Common': return 10000;
    case 'Limited': return 1000;
    case 'Rare': return 100;
    case 'SuperRare': return 10;
    case 'Unique': return 1;
    default: return 0;
  }
}
```

### 9.2 Analytics Dashboard

```typescript
// supabase/functions/admin/analytics/index.ts
interface AnalyticsRequest {
  metric: 'games' | 'users' | 'cards' | 'revenue';
  timeframe: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}

serve(async (req) => {
  try {
    const request = await req.json() as AnalyticsRequest;
    const supabase = createAdminClient(req);
    
    // Calculer les dates
    const { startDate, endDate } = calculateDateRange(request);
    
    // Récupérer les métriques
    let data;
    switch (request.metric) {
      case 'games':
        data = await getGameMetrics(supabase, startDate, endDate);
        break;
      case 'users':
        data = await getUserMetrics(supabase, startDate, endDate);
        break;
      case 'cards':
        data = await getCardMetrics(supabase, startDate, endDate);
        break;
      case 'revenue':
        data = await getRevenueMetrics(supabase, startDate, endDate);
        break;
    }

    return new Response(JSON.stringify({ data }), { status: 200 });

  } catch (error) {
    return errorResponse(error);
  }
});

async function getGameMetrics(
  supabase: any, 
  startDate: string, 
  endDate: string
) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) throw error;

  const metrics = {
    totalGames: data.length,
    completedGames: data.filter(g => g.status === 'completed').length,
    abandonedGames: data.filter(g => 
      g.result_a === 'abandon' || g.result_b === 'abandon'
    ).length,
    averageDuration: calculateAverageDuration(data),
    gamesByMode: groupByMode(data),
    peakHours: calculatePeakHours(data)
  };

  return metrics;
}

async function getUserMetrics(
  supabase: any,
  startDate: string,
  endDate: string
) {
  const { data: newUsers } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const { data: activeUsers } = await supabase
    .from('games')
    .select('player_a, player_b')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Compter les utilisateurs uniques
  const uniqueUsers = new Set();
  activeUsers.forEach(game => {
    uniqueUsers.add(game.player_a);
    uniqueUsers.add(game.player_b);
  });

  return {
    newUsers: newUsers.length,
    activeUsers: uniqueUsers.size,
    retentionRate: calculateRetention(supabase, startDate, endDate),
    averageGamesPerUser: activeUsers.length / uniqueUsers.size
  };
}

async function getCardMetrics(
  supabase: any,
  startDate: string,
  endDate: string
) {
  // Cartes les plus jouées
  const { data: mostPlayed } = await supabase
    .from('moves')
    .select(`
      actor_card_id,
      card:players(name, rarity)
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('count', { ascending: false })
    .limit(10);

  // Distribution par rareté
  const { data: distribution } = await supabase
    .from('user_players')
    .select(`
      player_id,
      card:players(rarity)
    `)
    .gte('obtained_at', startDate)
    .lte('obtained_at', endDate);

  return {
    mostPlayedCards: mostPlayed,
    rarityDistribution: groupByRarity(distribution),
    averageCardsPerPlayer: calculateAverageCards(supabase)
  };
}

async function getRevenueMetrics(
  supabase: any,
  startDate: string,
  endDate: string
) {
  const { data: purchases } = await supabase
    .from('purchases')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
  const averageOrderValue = totalRevenue / purchases.length;
  
  const revenueByDay = groupByDay(purchases);
  const revenueByPackType = groupByPackType(purchases);

  return {
    totalRevenue,
    averageOrderValue,
    totalPurchases: purchases.length,
    revenueByDay,
    revenueByPackType,
    topSpenders: await getTopSpenders(supabase, 10)
  };
}
```

## 10. Utility Functions

```typescript
// shared/utils.ts
export function createAuthenticatedClient(req: Request) {
  const authHeader = req.headers.get('Authorization');
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
}

export function createServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: 'Non autorisé' }), { 
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function errorResponse(error: any) {
  console.error('Error:', error);
  return new Response(JSON.stringify({ 
    error: error.message || 'Erreur interne du serveur' 
  }), { 
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function isPlayerInGame(userId: string, game: any): boolean {
  return game.player_a === userId || game.player_b === userId;
}

export function isPlayerTurn(userId: string, game: any): boolean {
  return game.current_player === userId;
}

export function getNextPlayer(game: any): string {
  return game.current_player === game.player_a ? game.player_b : game.player_a;
}

export function calculateMMRChange(
  winnerMMR: number,
  loserMMR: number,
  isDraw: boolean = false
): { winner_change: number; loser_change: number } {
  const K = 32; // K-factor
  const expectedWinner = 1 / (1 + Math.pow(10, (loserMMR - winnerMMR) / 400));
  const expectedLoser = 1 - expectedWinner;
  
  if (isDraw) {
    return {
      winner_change: Math.round(K * (0.5 - expectedWinner)),
      loser_change: Math.round(K * (0.5 - expectedLoser))
    };
  }
  
  return {
    winner_change: Math.round(K * (1 - expectedWinner)),
    loser_change: Math.round(K * (0 - expectedLoser))
  };
}

export function validateCardData(cardData: any): boolean {
  const required = ['name', 'position', 'rarity', 'shot', 'dribble', 'pass', 'block', 'cp_cost'];
  return required.every(field => cardData[field] !== undefined);
}

export function generateHash(data: any): string {
  const str = JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
}
```