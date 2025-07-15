export const gameGuards = {
  // Vérifier si tous les joueurs sont présents
  allPlayersReady: (context) => {
    return !!context.playerA && !!context.playerB;
  },

  // Vérifier si c'est l'action du joueur actuel
  isCurrentPlayerAction: (context, event) => {
    return event.player === context.currentPlayer;
  },

  // Vérifier si toutes les cartes sont placées
  allCardsPlaced: (context) => {
    const countA = context.placementCount[context.playerA] || 0;
    const countB = context.placementCount[context.playerB] || 0;
    return countA === 8 && countB === 8;
  },

  // Vérifier si tous ont confirmé
  allPlayersConfirmed: (context) => {
    return context.confirmations?.size === 2;
  },

  // Vérifier si c'est la mi-temps
  isHalfTime: (context) => {
    return context.currentTurn === 5;
  },

  // Vérifier si c'est la fin du jeu
  isGameEnd: (context) => {
    return context.currentTurn === 10;
  },

  // Vérifier si le placement mi-temps est complet
  halfTimePlacementComplete: (context) => {
    return context.halfTimePlacements?.size === 2;
  }
};