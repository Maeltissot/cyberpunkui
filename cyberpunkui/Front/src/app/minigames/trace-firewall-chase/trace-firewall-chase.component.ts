import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';

type ChasePhase =
  | 'stage-1'
  | 'stage-2'
  | 'turrets'
  | 'locked';

type TurretState =
  | 'armed'
  | 'distracted'
  | 'shutdown'
  | 'malfunction';

interface GridCell {
  x: number;
  y: number;
  blocked: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface ChaseConfig {
  phase: ChasePhase;
  size: number;
  start: Position;
  target: Position;
  blocked: string[];
  tickMs: number;
  sweepPenalty: number;
}

interface StoredFirewallState {
  phase?: ChasePhase;
  turretStates?: TurretState[];
}

@Component({
  selector: 'app-trace-firewall-chase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trace-firewall-chase.component.html',
  styleUrls: ['./trace-firewall-chase.component.scss']
})
export class TraceFirewallChaseComponent implements OnInit, OnDestroy {

  readonly maxTrace = 100;
  readonly storageKey = 'trace-firewall-chase-state';
  readonly turrets = [
    'TURRET A-17',
    'TURRET B-04',
    'TURRET C-31',
    'TURRET D-09'
  ];

  readonly configs: Record<'stage-1' | 'stage-2', ChaseConfig> = {
    'stage-1': {
      phase: 'stage-1',
      size: 7,
      start: { x: 0, y: 3 },
      target: { x: 6, y: 3 },
      blocked: ['2:1', '2:2', '2:5', '3:4', '4:1', '4:2', '5:5'],
      tickMs: 780,
      sweepPenalty: 12
    },
    'stage-2': {
      phase: 'stage-2',
      size: 9,
      start: { x: 0, y: 4 },
      target: { x: 8, y: 4 },
      blocked: [
        '1:1', '1:7', '2:3', '2:5', '3:1', '3:2', '3:6',
        '4:4', '5:2', '5:6', '6:3', '6:5', '7:1', '7:7'
      ],
      tickMs: 620,
      sweepPenalty: 15
    }
  };

  cells: GridCell[] = [];
  phase: ChasePhase = 'stage-1';
  turretStates: TurretState[] = this.turrets.map(() => 'armed');
  player: Position = { x: 0, y: 3 };
  target: Position = { x: 6, y: 3 };
  size = 7;
  horizontalSweep = 0;
  verticalSweep = 6;
  trace = 0;
  moves = 0;
  message = 'SIGNAL LIVE';

  private sweepDirection = 1;
  private sweepTimer?: number;

  ngOnInit() {
    this.loadState();
    this.loadPhase(this.phase);
  }

  ngOnDestroy() {
    this.stopSweep();
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {
    if (this.phase !== 'stage-1' && this.phase !== 'stage-2') {
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.move(0, -1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.move(0, 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.move(-1, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.move(1, 0);
        break;
    }
  }

  move(deltaX: number, deltaY: number) {
    if (this.phase !== 'stage-1' && this.phase !== 'stage-2') {
      return;
    }

    const next = {
      x: this.player.x + deltaX,
      y: this.player.y + deltaY
    };

    if (!this.isInside(next) || this.isBlocked(next)) {
      this.addTrace(9, 'COLLISION TRACE');
      return;
    }

    this.player = next;
    this.moves++;
    this.addTrace(this.phase === 'stage-1' ? 2 : 3, 'TRACE FIREWALL ACTIVE');
    this.checkSweepHit();

    if (
      this.player.x === this.target.x &&
      this.player.y === this.target.y
    ) {
      this.completeStage();
    }
  }

  overrideTurret(index: number, state: TurretState) {
    if (this.phase !== 'turrets') {
      return;
    }

    this.turretStates = this.turretStates.map((current, turretIndex) =>
      turretIndex === index
        ? state
        : current
    );
    this.message = `${this.turrets[index]} ${state.toUpperCase()}`;
    this.saveState();
  }

  isPlayer(cell: GridCell): boolean {
    return cell.x === this.player.x &&
      cell.y === this.player.y;
  }

  isTarget(cell: GridCell): boolean {
    return cell.x === this.target.x &&
      cell.y === this.target.y;
  }

  isSwept(cell: GridCell): boolean {
    return cell.y === this.horizontalSweep ||
      cell.x === this.verticalSweep;
  }

  private completeStage() {
    this.stopSweep();

    if (this.phase === 'stage-1') {
      this.phase = 'stage-2';
      this.saveState();
      this.loadPhase('stage-2');
      return;
    }

    this.phase = 'turrets';
    this.message = 'TURRET OVERRIDE BUS EXPOSED';
    this.saveState();
  }

  private loadPhase(phase: ChasePhase) {
    this.stopSweep();

    if (phase === 'locked') {
      this.phase = 'locked';
      this.message = 'ENTRY LOCKED';
      return;
    }

    if (phase === 'turrets') {
      this.phase = 'turrets';
      this.message = 'TURRET OVERRIDE BUS EXPOSED';
      return;
    }

    const config = this.configs[phase];
    const blockedCells = new Set(config.blocked);

    this.phase = phase;
    this.size = config.size;
    this.player = { ...config.start };
    this.target = { ...config.target };
    this.horizontalSweep = 0;
    this.verticalSweep = config.size - 1;
    this.sweepDirection = 1;
    this.trace = 0;
    this.moves = 0;
    this.message = phase === 'stage-1'
      ? 'SIGNAL LIVE'
      : 'SECOND FIREWALL ONLINE';
    this.cells = [];

    for (let y = 0; y < config.size; y++) {
      for (let x = 0; x < config.size; x++) {
        this.cells.push({
          x,
          y,
          blocked: blockedCells.has(`${x}:${y}`)
        });
      }
    }

    this.startSweep(config);
  }

  private startSweep(config: ChaseConfig) {
    this.sweepTimer = window.setInterval(() => {
      this.horizontalSweep += this.sweepDirection;
      this.verticalSweep -= this.sweepDirection;

      if (
        this.horizontalSweep === config.size - 1 ||
        this.horizontalSweep === 0
      ) {
        this.sweepDirection *= -1;
      }

      this.checkSweepHit();
    }, config.tickMs);
  }

  private stopSweep() {
    if (this.sweepTimer) {
      window.clearInterval(this.sweepTimer);
      this.sweepTimer = undefined;
    }
  }

  private checkSweepHit() {
    if (
      this.player.y === this.horizontalSweep ||
      this.player.x === this.verticalSweep
    ) {
      this.addTrace(
        this.configs[this.phase as 'stage-1' | 'stage-2'].sweepPenalty,
        'FIREWALL SWEEP LOCKED'
      );
    }
  }

  private addTrace(amount: number, message: string) {
    this.trace = Math.min(
      this.maxTrace,
      this.trace + amount
    );
    this.message = message;

    if (this.trace >= this.maxTrace) {
      this.phase = 'locked';
      this.message = 'ENTRY LOCKED';
      this.stopSweep();
      this.saveState();
    }
  }

  private isInside(position: Position): boolean {
    return position.x >= 0 &&
      position.y >= 0 &&
      position.x < this.size &&
      position.y < this.size;
  }

  private isBlocked(position: Position): boolean {
    return this.cells.some(cell =>
      cell.x === position.x &&
      cell.y === position.y &&
      cell.blocked
    );
  }

  private loadState() {
    try {
      const raw = localStorage.getItem(this.storageKey);

      if (!raw) {
        return;
      }

      const state = JSON.parse(raw) as StoredFirewallState;

      if (this.isPhase(state.phase)) {
        this.phase = state.phase;
      }

      if (
        Array.isArray(state.turretStates) &&
        state.turretStates.length === this.turrets.length
      ) {
        this.turretStates = state.turretStates;
      }
    } catch {
      this.phase = 'stage-1';
    }
  }

  private saveState() {
    try {
      const state: StoredFirewallState = {
        phase: this.phase,
        turretStates: this.turretStates
      };

      localStorage.setItem(
        this.storageKey,
        JSON.stringify(state)
      );
    } catch {
      // The chase remains playable if storage is unavailable.
    }
  }

  private isPhase(phase: unknown): phase is ChasePhase {
    return phase === 'stage-1' ||
      phase === 'stage-2' ||
      phase === 'turrets' ||
      phase === 'locked';
  }
}
