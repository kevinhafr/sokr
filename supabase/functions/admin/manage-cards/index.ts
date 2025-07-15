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