import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel
} from '@microsoft/signalr';
import { ApiBaseUrl } from '../constants';
import { IntrusionService } from './intrusion.service';
import { GhostMessageService } from './message.service';

interface MessageEventPayload {
  user?: unknown;
  message?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class GameRealtimeService {

  private readonly reconnectDelayMs = 5000;

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly connection: HubConnection =
    new HubConnectionBuilder()
      .withUrl(`${ApiBaseUrl}/gameHub`)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

  constructor(
    private readonly intrusion: IntrusionService,
    private readonly ghostMessage: GhostMessageService,
    private readonly router: Router,
    private readonly zone: NgZone
  ) {
    this.registerHandlers();
    void this.start();
  }

  private registerHandlers(): void {
    this.connection.on('Wordle', word => this.triggerWordle(word));
    this.connection.on('wordle', word => this.triggerWordle(word));
    this.connection.on('Message', payload => this.triggerMessage(payload));
    this.connection.on('message', payload => this.triggerMessage(payload));

    this.connection.onclose(() => {
      this.scheduleReconnect();
    });
  }

  private async start(): Promise<void> {
    if (
      this.connection.state === HubConnectionState.Connected ||
      this.connection.state === HubConnectionState.Connecting ||
      this.connection.state === HubConnectionState.Reconnecting
    ) {
      return;
    }

    try {
      await this.connection.start();
      this.clearReconnectTimer();
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.start();
    }, this.reconnectDelayMs);
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectTimer) {
      return;
    }

    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private triggerWordle(word: unknown): void {
    if (this.router.url.startsWith('/admin')) {
      return;
    }

    if (typeof word !== 'string') {
      return;
    }

    const targetWord = word.trim();

    if (!targetWord) {
      return;
    }

    this.zone.run(() => {
      this.intrusion.trigger(targetWord);
    });
  }

  private triggerMessage(payload: unknown): void {
    if (this.router.url.startsWith('/admin')) {
      return;
    }

    if (!this.isMessagePayload(payload)) {
      return;
    }

    const user = payload.user.trim();
    const message = payload.message.trim();

    if (!user || !message) {
      return;
    }

    this.zone.run(() => {
      this.ghostMessage.show(user, message);
    });
  }

  private isMessagePayload(payload: unknown): payload is { user: string; message: string } {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const messagePayload = payload as MessageEventPayload;

    return (
      typeof messagePayload.user === 'string' &&
      typeof messagePayload.message === 'string'
    );
  }
}
