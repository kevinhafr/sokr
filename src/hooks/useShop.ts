// hooks/useShop.ts
import { useState, useEffect, useCallback } from 'react';
import { PackType, Purchase, PlayerCard } from '@/types';
import { supabase } from '@/services/supabase';
import { useAuth } from './useAuth';

interface UseShopReturn {
  packTypes: PackType[];
  purchases: Purchase[];
  isLoading: boolean;
  error: Error | null;
  purchasePack: (packTypeId: string, paymentToken: string) => Promise<Purchase>;
  openPack: (purchaseId: string) => Promise<PlayerCard[]>;
  loadPurchaseHistory: () => Promise<void>;
}

export function useShop(): UseShopReturn {
  const { user } = useAuth();
  const [packTypes, setPackTypes] = useState<PackType[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    loadPackTypes();
    loadPurchaseHistory();
  }, [user]);

  const loadPackTypes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pack_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setPackTypes(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPurchaseHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          pack_type:pack_types(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (err) {
      setError(err as Error);
    }
  };

  const purchasePack = useCallback(async (
    packTypeId: string,
    paymentToken: string
  ): Promise<Purchase> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Traiter le paiement (à implémenter selon la plateforme)
      const platform = detectPlatform();
      
      const { data, error } = await supabase.functions.invoke('process-purchase', {
        body: {
          packTypeId,
          paymentToken,
          platform,
        },
      });

      if (error) throw error;

      // Ajouter à l'historique
      setPurchases(prev => [data, ...prev]);

      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [user]);

  const openPack = useCallback(async (purchaseId: string): Promise<PlayerCard[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('open-pack', {
        body: {
          purchaseId,
        },
      });

      if (error) throw error;

      // Mettre à jour l'achat comme ouvert
      setPurchases(prev => 
        prev.map(p => 
          p.id === purchaseId 
            ? { ...p, opened_at: new Date().toISOString(), cards_received: data.cards }
            : p
        )
      );

      return data.cards;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    packTypes,
    purchases,
    isLoading,
    error,
    purchasePack,
    openPack,
    loadPurchaseHistory,
  };
}

function detectPlatform(): string {
  // Détecter la plateforme (iOS, Android, Web)
  // Implémentation simplifiée
  return 'web';
}