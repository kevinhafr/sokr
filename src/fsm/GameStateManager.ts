export class GameStateManager {
  private machine: any;
  private service: any;
  private channel: RealtimeChannel;

  constructor(gameId: string) {
    this.machine = gameMachine.withConfig({
      actions: gameActions,
      guards: gameGuards
    });

    this.service = interpret(this.machine)
      .onTransition((state) => {
        this.broadcastStateChange(state);
      })
      .start();

    this.initializeRealtimeChannel(gameId);
  }

  private initializeRealtimeChannel(gameId: string) {
    this.channel = supabase
      .channel(`game:${gameId}`)
      .on('broadcast', { event: 'game_event' }, ({ payload }) => {
        this.service.send(payload);
      })
      .subscribe();
  }

  private broadcastStateChange(state: any) {
    this.channel.send({
      type: 'broadcast',
      event: 'state_update',
      payload: {
        state: state.value,
        context: state.context
      }
    });
  }

  public sendEvent(event: GameEvent) {
    // Validation côté client
    if (this.validateEvent(event)) {
      this.service.send(event);
      
      // Broadcast aux autres joueurs
      this.channel.send({
        type: 'broadcast',
        event: 'game_event',
        payload: event
      });
    }
  }

  private validateEvent(event: GameEvent): boolean {
    const currentState = this.service.state;
    
    // Vérifier si l'event est autorisé dans l'état actuel
    switch (currentState.value) {
      case 'activeTurnA':
        return event.player === currentState.context.playerA;
      case 'activeTurnB':
        return event.player === currentState.context.playerB;
      default:
        return true;
    }
  }
}