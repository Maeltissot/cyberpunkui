import { Component, HostListener, OnDestroy, signal } from '@angular/core';
import { FilesystemService } from '../services/filesystem.service';
import { WindowManagerService } from '../services/window-manager.service';
import { FileNode } from '../models/file-node.model';
import { WindowComponent } from '../shared/window/window.component';
import { CommonModule } from '@angular/common';
import { CommandService } from '../services/command.service';
import { FormsModule } from '@angular/forms';

type DesktopPhase = 'login' | 'firewall' | 'alarm' | 'connecting' | 'desktop';

interface FirewallCell {
  x: number;
  y: number;
  blocked: boolean;
}

interface Position {
  x: number;
  y: number;
}

@Component({
  selector: 'app-desktop',
  imports: [WindowComponent,CommonModule,FormsModule],
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss'],
  standalone: true
})
export class DesktopComponent implements OnDestroy {
  readonly loginUser = 'K.Rad';
  readonly password = 'Lesvenn';
  readonly firewallSize = 7;
  readonly maxTrace = 100;

  phase = signal<DesktopPhase>('login');
  enteredPassword = '';
  loginMessage = signal('REMOTE SESSION LOCKED');
  connectionProgress = signal(0);
  firewallCells = signal<FirewallCell[]>([]);
  player = signal<Position>({ x: 0, y: 3 });
  target = signal<Position>({ x: 6, y: 3 });
  firewallTrace = signal(0);
  firewallMessage = signal('FIREWALL VECTOR OPEN');
  horizontalSweep = signal(0);
  verticalSweep = signal(6);

  private horizontalDirection = 1;
  private verticalDirection = -1;
  private sweepTimer?: number;

  constructor(
    public filesystem: FilesystemService,
    public windowManager: WindowManagerService,
    private terminal: CommandService
  ) {
 this.terminal.events$
    .subscribe(event => {

     
    });

  }

  @HostListener('window:keydown', ['$event'])
  handleFirewallKeys(event: KeyboardEvent) {
    if (this.phase() !== 'firewall') {
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.moveFirewallPlayer(0, -1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveFirewallPlayer(0, 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.moveFirewallPlayer(-1, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.moveFirewallPlayer(1, 0);
        break;
    }
  }

  open(file: FileNode) {
    this.windowManager.open(file);
  }

  submitPassword() {
    if (this.enteredPassword.trim() === this.password) {
      this.startConnectionAnimation();
      return;
    }

    this.enteredPassword = '';
    this.loginMessage.set('PASSWORD REJECTED - FIREWALL CHALLENGE DEPLOYED');
    this.startFirewall();
  }

  isFirewallPlayer(cell: FirewallCell): boolean {
    const player = this.player();

    return cell.x === player.x &&
      cell.y === player.y;
  }

  isFirewallTarget(cell: FirewallCell): boolean {
    const target = this.target();

    return cell.x === target.x &&
      cell.y === target.y;
  }

  isFirewallSwept(cell: FirewallCell): boolean {
    return cell.y === this.horizontalSweep() ||
      cell.x === this.verticalSweep();
  }

  private startConnectionAnimation() {
    this.phase.set('connecting');
    this.loginMessage.set('PASSWORD ACCEPTED');
    this.connectionProgress.set(0);

    const timer = window.setInterval(() => {
      const next = Math.min(this.connectionProgress() + 8, 100);
      this.connectionProgress.set(next);

      if (next >= 100) {
        window.clearInterval(timer);
        this.stopFirewallSweep();
        this.phase.set('desktop');
      }
    }, 130);
  }

  private startFirewall() {
    const start = { x: 0, y: Math.floor(this.firewallSize / 2) };
    const target = { x: this.firewallSize - 1, y: Math.floor(this.firewallSize / 2) };
    const safePath = this.generateSafePath(start, target);
    const cells: FirewallCell[] = [];

    for (let y = 0; y < this.firewallSize; y++) {
      for (let x = 0; x < this.firewallSize; x++) {
        const key = `${x}:${y}`;
        cells.push({
          x,
          y,
          blocked: !safePath.has(key) && Math.random() < 0.34
        });
      }
    }

    this.stopFirewallSweep();
    this.player.set(start);
    this.target.set(target);
    this.firewallCells.set(cells);
    this.firewallTrace.set(0);
    this.horizontalSweep.set(0);
    this.verticalSweep.set(this.firewallSize - 1);
    this.horizontalDirection = 1;
    this.verticalDirection = -1;
    this.firewallMessage.set('FIREWALL VECTOR OPEN');
    this.phase.set('firewall');
    this.startFirewallSweep();
  }

  private moveFirewallPlayer(deltaX: number, deltaY: number) {
    const current = this.player();
    const next = {
      x: current.x + deltaX,
      y: current.y + deltaY
    };

    if (!this.isInsideFirewall(next) || this.isBlockedFirewall(next)) {
      this.addFirewallTrace(18, 'COLLISION TRACE');
      return;
    }

    this.player.set(next);
    this.addFirewallTrace(5, 'TRACE RISING');
    this.checkFirewallSweepHit();

    const target = this.target();
    if (next.x === target.x && next.y === target.y) {
      this.stopFirewallSweep();
      this.loginMessage.set('FIREWALL BYPASSED - REAUTHENTICATE');
      this.phase.set('login');
    }
  }

  private addFirewallTrace(amount: number, message: string) {
    const trace = Math.min(this.maxTrace, this.firewallTrace() + amount);
    this.firewallTrace.set(trace);
    this.firewallMessage.set(message);

    if (trace >= this.maxTrace) {
      this.stopFirewallSweep();
      this.phase.set('alarm');
      this.loginMessage.set('Attempt detected, alarm raised');

      setTimeout(() => {
        this.phase.set('login');
      }, 1800);
    }
  }

  private startFirewallSweep() {
    this.sweepTimer = window.setInterval(() => {
      const nextHorizontal = this.horizontalSweep() + this.horizontalDirection;
      const nextVertical = this.verticalSweep() + this.verticalDirection;

      this.horizontalSweep.set(nextHorizontal);
      this.verticalSweep.set(nextVertical);

      if (nextHorizontal === 0 || nextHorizontal === this.firewallSize - 1) {
        this.horizontalDirection *= -1;
      }

      if (nextVertical === 0 || nextVertical === this.firewallSize - 1) {
        this.verticalDirection *= -1;
      }

      this.checkFirewallSweepHit();
    }, 720);
  }

  private stopFirewallSweep() {
    if (this.sweepTimer) {
      window.clearInterval(this.sweepTimer);
      this.sweepTimer = undefined;
    }
  }

  private checkFirewallSweepHit() {
    const player = this.player();

    if (
      player.y === this.horizontalSweep() ||
      player.x === this.verticalSweep()
    ) {
      this.addFirewallTrace(16, 'SCAN SWEEP LOCKED');
    }
  }

  private isInsideFirewall(position: Position): boolean {
    return position.x >= 0 &&
      position.y >= 0 &&
      position.x < this.firewallSize &&
      position.y < this.firewallSize;
  }

  private isBlockedFirewall(position: Position): boolean {
    return this.firewallCells().some(cell =>
      cell.x === position.x &&
      cell.y === position.y &&
      cell.blocked
    );
  }

  private generateSafePath(start: Position, target: Position): Set<string> {
    const path = new Set<string>();
    let current = { ...start };
    path.add(`${current.x}:${current.y}`);

    while (current.x < target.x) {
      const canMoveVertically = Math.random() > 0.58 &&
        current.y > 1 &&
        current.y < this.firewallSize - 2;

      if (canMoveVertically) {
        current = {
          x: current.x,
          y: current.y + (Math.random() > 0.5 ? 1 : -1)
        };
      } else {
        current = {
          x: current.x + 1,
          y: current.y
        };
      }

      path.add(`${current.x}:${current.y}`);
    }

    while (current.y !== target.y) {
      current = {
        x: current.x,
        y: current.y + (current.y < target.y ? 1 : -1)
      };
      path.add(`${current.x}:${current.y}`);
    }

    return path;
  }

  ngOnInit() {
    console.log(this.filesystem.root);
  }

  ngOnDestroy() {
    this.stopFirewallSweep();
  }
}
