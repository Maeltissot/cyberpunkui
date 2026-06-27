import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IntrusionService {

  active = signal(false);

  targetWord = signal('');

  attempts = signal(6);

  trigger(word: string) {

    this.targetWord.set(
      word.toUpperCase()
    );

    this.attempts.set(6);

    this.active.set(true);
  }

  success() {
    this.active.set(false);
  }

  fail() {
    this.active.set(false);
  }
}