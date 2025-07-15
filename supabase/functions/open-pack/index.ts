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