import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FileNode } from '../../models/file-node.model';

type HackToken = {
  text: string;
  kind: 'junk' | 'word' | 'bracket';
  used?: boolean;
};

type HackLine = {
  address: string;
  tokens: HackToken[];
};

@Component({
  selector: 'app-shard-hack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shard-hack.component.html',
  styleUrls: ['./shard-hack.component.scss']
})
export class ShardHackComponent implements OnInit {
  @Input() file!: FileNode;
  @Output() unlocked = new EventEmitter<void>();

  readonly maxAttempts = 4;
  readonly wordLength = 8;

  attempts = signal(this.maxAttempts);
  lines = signal<HackLine[]>([]);
  log = signal<string[]>([]);
  phase = signal<'booting' | 'playing' | 'downloading' | 'complete' | 'locked'>('booting');
  downloadProgress = signal(0);

  private readonly words = [
    'FIREWALL',
    'DATAMINE',
    'BACKDOOR',
    'OVERRIDE',
    'TERMINAL',
    'PROTOCOL',
    'PASSWORD',
    'ENCRYPTS',
    'DATABASE',
    'SECURITY',
    'TRANSFER',
    'NETWATCH'
  ];

  private password = 'DATAMINE';
  private bracketActionsRemaining = 4;

  ngOnInit(): void {
    this.reset();
  }

  reset(): void {
    this.password = this.words[Math.floor(Math.random() * this.words.length)];
    this.attempts.set(this.maxAttempts);
    this.phase.set('booting');
    this.downloadProgress.set(0);
    this.bracketActionsRemaining = 4;
    this.lines.set(this.buildTerminalLines());
    this.log.set([
      'ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL',
      'ENTER PASSWORD NOW',
      `${this.maxAttempts} ATTEMPT(S) LEFT`
    ]);

    setTimeout(() => this.phase.set('playing'), 450);
  }

  selectToken(token: HackToken): void {
    if (this.phase() !== 'playing' || token.used) {
      return;
    }

    if (token.kind === 'word') {
      this.tryPassword(token);
      return;
    }

    if (token.kind === 'bracket') {
      this.useBracket(token);
    }
  }

  private tryPassword(token: HackToken): void {
    token.used = true;
    this.refreshLines();

    const likeness = this.getLikeness(token.text, this.password);

    if (token.text === this.password) {
      this.log.update(lines => [
        ...lines,
        `>${token.text}`,
        '>EXACT MATCH',
        '>ACCESS GRANTED'
      ]);
      this.startDownload();
      return;
    }

    const nextAttempts = this.attempts() - 1;
    this.attempts.set(nextAttempts);
    this.log.update(lines => [
      ...lines.slice(-8),
      `>${token.text}`,
      `>ENTRY DENIED`,
      `>LIKENESS=${likeness}`,
      `>${nextAttempts} ATTEMPT(S) LEFT`
    ]);

    if (nextAttempts <= 0) {
      this.phase.set('locked');
      this.log.update(lines => [
        ...lines,
        '>TERMINAL LOCKED',
        '>REOPEN FILE TO RETRY'
      ]);
    }
  }

  private useBracket(token: HackToken): void {
    token.used = true;

    if (this.bracketActionsRemaining <= 0) {
      this.log.update(lines => [...lines.slice(-8), `>${token.text}`, '>NO VALID SEQUENCE']);
      return;
    }

    this.bracketActionsRemaining--;

    const removableWords = this.lines()
      .flatMap(line => line.tokens)
      .filter(t => t.kind === 'word' && !t.used && t.text !== this.password);

    if (this.attempts() < this.maxAttempts && Math.random() > 0.45) {
      this.attempts.set(this.maxAttempts);
      this.log.update(lines => [...lines.slice(-8), `>${token.text}`, '>ALLOWANCE REPLENISHED']);
      return;
    }

    const dud = removableWords[Math.floor(Math.random() * removableWords.length)];

    if (dud) {
      dud.used = true;
      this.refreshLines();
      this.log.update(lines => [...lines.slice(-8), `>${token.text}`, '>DUD REMOVED']);
      return;
    }

    this.log.update(lines => [...lines.slice(-8), `>${token.text}`, '>ALLOWANCE REPLENISHED']);
    this.attempts.set(this.maxAttempts);
  }

  private startDownload(): void {
    this.phase.set('downloading');

    const timer = setInterval(() => {
      const next = Math.min(this.downloadProgress() + 5 + Math.floor(Math.random() * 8), 100);
      this.downloadProgress.set(next);

      if (next >= 100) {
        clearInterval(timer);
        this.phase.set('complete');
        this.log.update(lines => [...lines.slice(-8), '>DOWNLOADING SHARD COMPLETE']);

        setTimeout(() => this.unlocked.emit(), 550);
      }
    }, 180);
  }

  private getLikeness(guess: string, target: string): number {
    return guess
      .split('')
      .filter((letter, index) => letter === target[index])
      .length;
  }

  private buildTerminalLines(): HackLine[] {
    const words = [...this.words].sort(() => Math.random() - 0.5);
    const bracketPairs = ['()', '[]', '{}', '<>'];
    const lines: HackLine[] = [];

    for (let row = 0; row < 16; row++) {
      const tokens: HackToken[] = [];
      let width = 0;
      const word = words[row];
      const bracketPair = bracketPairs[row - 12];
      const bracketText = bracketPair
        ? `${bracketPair[0]}${this.randomJunk(2 + Math.floor(Math.random() * 4))}${bracketPair[1]}`
        : '';
      const fixedWidth = (word?.length ?? 0) + bracketText.length;
      const leadingWidth = Math.floor(Math.random() * Math.max(1, 28 - fixedWidth));

      width = this.addJunk(tokens, width, leadingWidth);

      if (word) {
        tokens.push({ text: word, kind: 'word' });
        width += word.length;
      }

      const gap = Math.floor(Math.random() * Math.max(1, 28 - width - bracketText.length));
      width = this.addJunk(tokens, width, width + gap);

      if (bracketText) {
        tokens.push({ text: bracketText, kind: 'bracket' });
        width += bracketText.length;
      }

      while (width < 28) {
        const length = Math.min(1 + Math.floor(Math.random() * 4), 28 - width);
        const text = this.randomJunk(length);
        tokens.push({ text, kind: 'junk' });
        width += text.length;
      }

      lines.push({
        address: `0x${(0xf000 + row * 12).toString(16).toUpperCase()}`,
        tokens
      });
    }

    return lines;
  }

  private addJunk(tokens: HackToken[], width: number, targetWidth: number): number {
    while (width < targetWidth) {
      const length = Math.min(1 + Math.floor(Math.random() * 4), targetWidth - width);
      const text = this.randomJunk(length);
      tokens.push({ text, kind: 'junk' });
      width += text.length;
    }

    return width;
  }

  private randomJunk(length: number): string {
    const chars = '!@#$%^&*-_=+|;:,.?/`~';

    return Array.from({ length }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }

  private refreshLines(): void {
    this.lines.update(lines => [...lines]);
  }
}
