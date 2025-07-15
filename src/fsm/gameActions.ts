export const gameActions = {
  // Initialisation
  initializeGame: assign((context, event) => ({
    ...context,
    gameId: generateGameId(),
    boardState: initializeBoard(),
    ballPosition: 'Z2-2'
  })),

  // Gestion des joueurs
  registerPlayer: assign((context, event) => {
    if (event.type !== 'PLAYER_JOINED') return context;
    
    const updates: Partial<GameContext> = {};
    if (!context.playerA) {
      updates.playerA = event.player;
    } else if (!context.playerB) {
      updates.playerB = event.player;
    }
    
    return { ...context, ...updates };
  }),

  // Coin toss
  performCoinToss: (context) => {
    const winner = Math.random() < 0.5 ? context.playerA : context.playerB;
    // Envoyer résultat via Realtime
    sendRealtimeUpdate(context.gameId, {
      type: 'COIN_TOSS_RESULT',
      winner
    });
  },

  setCoinTossWinner: assign((context, event) => {
    if (event.type !== 'COIN_TOSS_COMPLETE') return context;
    return {
      ...context,
      coinTossWinner: event.winner,
      currentPlayer: event.winner // Le gagnant place en premier
    };
  }),

  // Placement
  placeCard: assign((context, event) => {
    if (event.type !== 'CARD_PLACED') return context;
    
    const newBoardState = { ...context.boardState };
    newBoardState[event.position] = {
      player: event.player,
      cardId: event.cardId
    };
    
    return {
      ...context,
      boardState: newBoardState
    };
  }),

  incrementPlacementCount: assign((context, event) => {
    if (event.type !== 'CARD_PLACED') return context;
    
    const count = context.placementCount[event.player] || 0;
    return {
      ...context,
      placementCount: {
        ...context.placementCount,
        [event.player]: count + 1
      }
    };
  }),

  // Actions de jeu
  updateGameState: assign((context, event) => {
    if (event.type !== 'ACTION_COMPLETE') return context;
    
    return {
      ...context,
      currentTurn: context.currentTurn + 1,
      scoreA: event.scoreA || context.scoreA,
      scoreB: event.scoreB || context.scoreB,
      ballPosition: event.ballPosition || context.ballPosition,
      boardState: event.boardState || context.boardState
    };
  }),

  // Gestion des timeouts
  startTurnTimer: (context) => {
    // Annuler l'ancien timer
    if (context.timeouts.turn) {
      clearTimeout(context.timeouts.turn);
    }
    
    // Nouveau timer
    const timer = setTimeout(() => {
      // Envoyer event TIMEOUT
      sendEvent(context.gameId, { type: 'TIMEOUT' });
    }, 45000);
    
    return assign({
      timeouts: {
        ...context.timeouts,
        turn: timer
      }
    });
  },

  // Fin de partie
  calculateResults: async (context) => {
    const result = {
      winner: context.scoreA > context.scoreB ? context.playerA : 
              context.scoreA < context.scoreB ? context.playerB : null,
      scoreA: context.scoreA,
      scoreB: context.scoreB,
      duration: Date.now() - context.startTime,
      turns: context.currentTurn
    };
    
    // Sauvegarder en base
    await saveGameResult(context.gameId, result);
  },

  updateMMR: async (context) => {
    const playerAProfile = await getProfile(context.playerA);
    const playerBProfile = await getProfile(context.playerB);
    
    const mmrChanges = calculateMMRChange(
      playerAProfile.mmr,
      playerBProfile.mmr,
      context.scoreA === context.scoreB
    );
    
    await updateProfile(context.playerA, {
      mmr: playerAProfile.mmr + mmrChanges.winner_change,
      wins: context.scoreA > context.scoreB ? playerAProfile.wins + 1 : playerAProfile.wins,
      losses: context.scoreA < context.scoreB ? playerAProfile.losses + 1 : playerAProfile.losses,
      draws: context.scoreA === context.scoreB ? playerAProfile.draws + 1 : playerAProfile.draws
    });
    
    await updateProfile(context.playerB, {
      mmr: playerBProfile.mmr + mmrChanges.loser_change,
      wins: context.scoreB > context.scoreA ? playerBProfile.wins + 1 : playerBProfile.wins,
      losses: context.scoreB < context.scoreA ? playerBProfile.losses + 1 : playerBProfile.losses,
      draws: context.scoreA === context.scoreB ? playerBProfile.draws + 1 : playerBProfile.draws
    });
  }
};