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