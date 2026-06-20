import { Injectable, signal } from '@angular/core';
import { GameScene } from '../models/scene.model';

export type GameLevel = 'level-1' | 'level-2';

interface StoredGameState {
  level?: GameLevel;
}


@Injectable({ providedIn: 'root' })
export class GameStateService {

  private readonly storageKey = 'cyberpunk-ui-game-state';

  scene = signal<GameScene>('cyberspace');

  level = signal<GameLevel>(
    this.loadState().level ?? 'level-1'
  );

  setScene(scene: GameScene) {
    this.scene.set(scene);
  }

  setLevel(level: GameLevel) {
    this.level.set(level);
    this.saveState();
  }

  resetSavedState() {
    this.level.set('level-1');
    this.scene.set('cyberspace');
    this.saveState();
  }

  private loadState(): StoredGameState {
    try {
      const raw =
        localStorage.getItem(this.storageKey);

      if (!raw) {
        return {};
      }

      const state =
        JSON.parse(raw) as StoredGameState;

      return {
        level: this.isGameLevel(state.level)
          ? state.level
          : undefined
      };
    } catch {
      return {};
    }
  }

  private saveState() {
    try {
      const state: StoredGameState = {
        level: this.level()
      };

      localStorage.setItem(
        this.storageKey,
        JSON.stringify(state)
      );
    } catch {
      // Ignore storage failures so the game still runs in private/browser-limited modes.
    }
  }

  private isGameLevel(
    level: unknown
  ): level is GameLevel {
    return level === 'level-1'
      || level === 'level-2'
      || level === 'level-3';
  }
}
