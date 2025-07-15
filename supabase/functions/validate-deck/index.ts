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