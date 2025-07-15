// utils/cards.ts
import { PlayerCard, UserPlayer, CardRarity } from '@/types';

export const getRarityColor = (rarity: CardRarity): string => {
  switch (rarity) {
    case 'Common':
      return '#B0BEC5';
    case 'Limited':
      return '#81C784';
    case 'Rare':
      return '#64B5F6';
    case 'SuperRare':
      return '#BA68C8';
    case 'Unique':
      return '#FFD54F';
    default:
      return '#FFFFFF';
  }
};

export const getRarityBonus = (rarity: CardRarity): number => {
  switch (rarity) {
    case 'Common':
    case 'Limited':
      return 0;
    case 'Rare':
    case 'SuperRare':
      return 1;
    case 'Unique':
      return 2;
    default:
      return 0;
  }
};

export const getPositionAbbreviation = (position: string): string => {
  switch (position) {
    case 'gardien':
      return 'GK';
    case 'defenseur':
      return 'DEF';
    case 'milieu':
      return 'MID';
    case 'attaquant':
      return 'ATT';
    default:
      return '?';
  }
};

export const getPositionColor = (position: string): string => {
  switch (position) {
    case 'gardien':
      return '#FFC107';
    case 'defenseur':
      return '#2196F3';
    case 'milieu':
      return '#4CAF50';
    case 'attaquant':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

export const calculateCardPower = (card: PlayerCard): number => {
  return card.shot + card.dribble + card.pass + card.block;
};

export const calculateCardEfficiency = (card: PlayerCard): number => {
  const power = calculateCardPower(card);
  return power / card.cp_cost;
};

export const getStatForAction = (
  card: PlayerCard,
  action: string,
  side: 'attack' | 'defense'
): number => {
  if (side === 'attack') {
    switch (action) {
      case 'shot':
        return card.shot;
      case 'pass':
        return card.pass;
      case 'dribble':
        return card.dribble;
      default:
        return 0;
    }
  } else {
    switch (action) {
      case 'shot':
        return card.position === 'gardien' ? card.block : 0;
      case 'pass':
      case 'dribble':
        return card.block;
      default:
        return 0;
    }
  }
};

export const getUpgradedStat = (
  baseStat: number,
  upgrades: Record<string, number>,
  statName: string
): number => {
  return baseStat + (upgrades[statName] || 0);
};

export const getRequiredXP = (currentLevel: number): number => {
  const xpTable = [0, 100, 250, 500, 1000];
  return xpTable[currentLevel] || 9999;
};

export const canLevelUp = (userCard: UserPlayer): boolean => {
  const requiredXP = getRequiredXP(userCard.level);
  return userCard.xp >= requiredXP;
};

export const getMaxLevel = (rarity: CardRarity): number => {
  switch (rarity) {
    case 'Common':
    case 'Limited':
      return 3;
    case 'Rare':
      return 4;
    case 'SuperRare':
    case 'Unique':
      return 5;
    default:
      return 3;
  }
};