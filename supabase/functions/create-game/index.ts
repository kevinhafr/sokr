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