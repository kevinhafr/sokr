import { createMachine, assign } from 'xstate';

export const gameMachine = createMachine<GameContext, GameEvent>({
  id: 'rocketFooty',
  initial: 'initializing',
  context: {
    gameId: '',
    playerA: '',
    playerB: '',
    currentPlayer: '',
    currentTurn: 0,
    coinTossWinner: null,
    scoreA: 0,
    scoreB: 0,
    boardState: {},
    ballPosition: 'Z2-2',
    timeouts: {
      turn: null,
      global: null
    },
    placementCount: {}
  },

  states: {
    initializing: {
      entry: 'initializeGame',
      on: {
        PLAYER_JOINED: {
          target: 'waitingForPlayers',
          actions: 'registerPlayer'
        }
      }
    },

    waitingForPlayers: {
      entry: 'setupWaitingRoom',
      on: {
        PLAYER_JOINED: [
          {
            target: 'coinToss',
            cond: 'allPlayersReady',
            actions: 'startCoinToss'
          },
          {
            actions: 'registerPlayer'
          }
        ],
        PLAYER_LEFT: {
          target: 'completed',
          actions: 'handleAbandon'
        },
        TIMEOUT: {
          target: 'completed',
          actions: 'handleTimeout'
        }
      },
      after: {
        45000: { target: 'completed', actions: 'handleTimeout' }
      }
    },

    coinToss: {
      entry: ['performCoinToss', 'notifyPlayers'],
      on: {
        COIN_TOSS_COMPLETE: {
          target: 'placement',
          actions: ['setCoinTossWinner', 'determineFirstPlacer']
        },
        TIMEOUT: {
          target: 'completed',
          actions: 'handleTimeout'
        }
      },
      after: {
        5000: { 
          target: 'placement',
          actions: 'autoCompleteCoinToss'
        }
      }
    },

    placement: {
      initial: 'placementTeamA',
      states: {
        placementTeamA: {
          entry: ['setCurrentPlayer', 'startTurnTimer'],
          on: {
            CARD_PLACED: {
              target: 'placementTeamB',
              cond: 'isCurrentPlayerAction',
              actions: ['placeCard', 'incrementPlacementCount']
            },
            TIMEOUT: {
              target: 'placementTeamB',
              actions: ['autoPlaceCard', 'penalizeTimeout']
            }
          },
          after: {
            20000: { 
              target: 'placementTeamB',
              actions: 'handlePlacementTimeout'
            }
          }
        },
        placementTeamB: {
          entry: ['setCurrentPlayer', 'startTurnTimer'],
          on: {
            CARD_PLACED: [
              {
                target: '#rocketFooty.placementLocked',
                cond: 'allCardsPlaced',
                actions: ['placeCard', 'incrementPlacementCount']
              },
              {
                target: 'placementTeamA',
                actions: ['placeCard', 'incrementPlacementCount']
              }
            ],
            TIMEOUT: {
              target: 'placementTeamA',
              actions: ['autoPlaceCard', 'penalizeTimeout']
            }
          },
          after: {
            20000: { 
              target: 'placementTeamA',
              actions: 'handlePlacementTimeout'
            }
          }
        }
      }
    },

    placementLocked: {
      entry: 'waitForConfirmations',
      on: {
        PLACEMENT_CONFIRMED: [
          {
            target: 'active',
            cond: 'allPlayersConfirmed',
            actions: 'startGame'
          },
          {
            actions: 'recordConfirmation'
          }
        ]
      },
      after: {
        5000: { 
          target: 'active',
          actions: 'autoStartGame'
        }
      }
    },

    active: {
      entry: 'initializeGamePlay',
      initial: 'activeTurnA',
      states: {
        activeTurnA: {
          entry: ['setCurrentPlayerA', 'startActionTimer', 'notifyTurn'],
          on: {
            ACTION_COMPLETE: [
              {
                target: '#rocketFooty.halfTime',
                cond: 'isHalfTime',
                actions: 'updateGameState'
              },
              {
                target: '#rocketFooty.completed',
                cond: 'isGameEnd',
                actions: 'endGame'
              },
              {
                target: 'activeTurnB',
                actions: 'updateGameState'
              }
            ],
            TIMEOUT: {
              target: 'activeTurnB',
              actions: ['autoAction', 'penalizeTimeout']
            },
            ABANDON: {
              target: '#rocketFooty.completed',
              actions: 'handleAbandon'
            }
          },
          after: {
            45000: { 
              target: 'activeTurnB',
              actions: 'handleActionTimeout'
            }
          }
        },
        activeTurnB: {
          entry: ['setCurrentPlayerB', 'startActionTimer', 'notifyTurn'],
          on: {
            ACTION_COMPLETE: [
              {
                target: '#rocketFooty.halfTime',
                cond: 'isHalfTime',
                actions: 'updateGameState'
              },
              {
                target: '#rocketFooty.completed',
                cond: 'isGameEnd',
                actions: 'endGame'
              },
              {
                target: 'activeTurnA',
                actions: 'updateGameState'
              }
            ],
            TIMEOUT: {
              target: 'activeTurnA',
              actions: ['autoAction', 'penalizeTimeout']
            },
            ABANDON: {
              target: '#rocketFooty.completed',
              actions: 'handleAbandon'
            }
          },
          after: {
            45000: { 
              target: 'activeTurnA',
              actions: 'handleActionTimeout'
            }
          }
        }
      }
    },

    halfTime: {
      entry: ['resetBoard', 'notifyHalfTime', 'distributeBonus'],
      on: {
        CARD_PLACED: {
          actions: 'placeHalfTimeCard'
        },
        PLACEMENT_CONFIRMED: [
          {
            target: 'active',
            cond: 'halfTimePlacementComplete',
            actions: 'resumeGame'
          }
        ]
      },
      after: {
        60000: { 
          target: 'active',
          actions: 'autoResumeFromHalfTime'
        }
      }
    },

    completed: {
      type: 'final',
      entry: ['calculateResults', 'updateMMR', 'saveHistory', 'notifyEnd']
    }
  }
});