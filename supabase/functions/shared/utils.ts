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