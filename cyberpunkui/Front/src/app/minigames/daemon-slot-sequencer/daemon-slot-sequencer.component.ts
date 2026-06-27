import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

type SequencerState =
  | 'active'
  | 'success'
  | 'locked';

interface Daemon {
  id: string;
  name: string;
  cost: number;
  description: string;
}

interface StoredSequencerState {
  state?: SequencerState;
  slots?: string[];
  trace?: number;
  attempts?: number;
  log?: string[];
}

@Component({
  selector: 'app-daemon-slot-sequencer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daemon-slot-sequencer.component.html',
  styleUrls: ['./daemon-slot-sequencer.component.scss']
})
export class DaemonSlotSequencerComponent implements OnInit {

  readonly storageKey = 'daemon-slot-sequencer-state';
  readonly maxTrace = 100;
  readonly maxSlots = 4;
  readonly solution = ['mask', 'spoof', 'decrypt', 'inject'];
  readonly daemons: Daemon[] = [
    {
      id: 'mask',
      name: 'MASK',
      cost: 12,
      description: 'Dampens trace before contact.'
    },
    {
      id: 'spoof',
      name: 'SPOOF',
      cost: 16,
      description: 'Copies the admin handoff.'
    },
    {
      id: 'decrypt',
      name: 'DECRYPT',
      cost: 22,
      description: 'Breaks credential wrapping.'
    },
    {
      id: 'inject',
      name: 'INJECT',
      cost: 26,
      description: 'Pushes the access daemon.'
    },
    {
      id: 'defrag',
      name: 'DEFRAG',
      cost: 8,
      description: 'Stabilizes memory, but wastes a slot.'
    },
    {
      id: 'silence',
      name: 'SILENCE',
      cost: 18,
      description: 'Mutes alerts after access.'
    }
  ];

  state: SequencerState = 'active';
  slots: string[] = [];
  trace = 0;
  attempts = 0;
  log = [
    'TARGET: ARASAKA ELEVATOR SUBNET',
    'LOAD 4 DAEMONS IN EXECUTION ORDER'
  ];

  ngOnInit() {
    this.loadState();
  }

  get totalCost(): number {
    return this.slots.reduce(
      (total, id) => total + (this.getDaemon(id)?.cost ?? 0),
      0
    );
  }

  addDaemon(daemon: Daemon) {
    if (
      this.state !== 'active' ||
      this.slots.length >= this.maxSlots ||
      this.isLoaded(daemon.id)
    ) {
      return;
    }

    const slotIndex =
      this.slots.length;

    this.slots = [
      ...this.slots,
      daemon.id
    ];
    this.pushLog(`${daemon.name} LOADED INTO SLOT ${this.slots.length}`);

    if (daemon.id !== this.solution[slotIndex]) {
      this.addTrace(5);
      this.pushLog('WRONG SLOT SIGNATURE: TRACE +5');
    }

    this.saveState();
  }

  removeSlot(index: number) {
    if (this.state !== 'active') {
      return;
    }

    const removed =
      this.getDaemon(this.slots[index]);

    this.slots = this.slots.filter((_, slotIndex) =>
      slotIndex !== index
    );

    if (removed) {
      this.pushLog(`${removed.name} EJECTED`);
    }

    this.saveState();
  }

  execute() {
    if (this.state !== 'active') {
      return;
    }

    if (this.slots.length < this.maxSlots) {
      this.addTrace(8);
      this.pushLog('EXECUTION FAILED: EMPTY DAEMON SLOT');
      this.saveState();
      return;
    }

    this.attempts++;

    if (this.isSolved()) {
      this.state = 'success';
      this.pushLog('CHAIN ACCEPTED: ROOT WINDOW OPEN');
      this.saveState();
      return;
    }

    const matchingSlots =
      this.slots.filter((id, index) =>
        id === this.solution[index]
      ).length;

    this.addTrace((this.maxSlots - matchingSlots) * 5);
    this.pushLog(`CHAIN REJECTED: ${matchingSlots}/${this.maxSlots} DAEMONS ALIGNED`);

    this.saveState();
  }

  reset() {
    this.state = 'active';
    this.slots = [];
    this.trace = 0;
    this.attempts = 0;
    this.log = [
      'TARGET: ARASAKA ELEVATOR SUBNET',
      'LOAD 4 DAEMONS IN EXECUTION ORDER'
    ];
    this.saveState();
  }

  getDaemon(id: string): Daemon | undefined {
    return this.daemons.find(daemon =>
      daemon.id === id
    );
  }

  isLoaded(id: string): boolean {
    return this.slots.includes(id);
  }

  private isSolved(): boolean {
    return this.solution.every((id, index) =>
      this.slots[index] === id
    );
  }

  private addTrace(amount: number) {
    this.trace = Math.min(
      this.maxTrace,
      this.trace + amount
    );

    if (this.trace >= this.maxTrace) {
      this.lockSubnet();
    }
  }

  private lockSubnet() {
    if (this.state === 'locked') {
      return;
    }

    this.state = 'locked';
    this.pushLog('SUBNET LOCKED BY DAEMON MISFIRE');
  }

  private pushLog(line: string) {
    this.log = [
      ...this.log.slice(-7),
      line
    ];
  }

  private loadState() {
    try {
      const raw =
        localStorage.getItem(this.storageKey);

      if (!raw) {
        return;
      }

      const state =
        JSON.parse(raw) as StoredSequencerState;

      if (this.isSequencerState(state.state)) {
        this.state = state.state;
      }

      if (Array.isArray(state.slots)) {
        this.slots = state.slots.filter(id =>
          this.daemons.some(daemon => daemon.id === id)
        ).slice(0, this.maxSlots);
      }

      if (typeof state.trace === 'number') {
        this.trace = Math.min(Math.max(state.trace, 0), this.maxTrace);
      }

      if (typeof state.attempts === 'number') {
        this.attempts = Math.max(state.attempts, 0);
      }

      if (Array.isArray(state.log)) {
        this.log = state.log;
      }
    } catch {
      this.reset();
    }
  }

  private saveState() {
    try {
      const state: StoredSequencerState = {
        state: this.state,
        slots: this.slots,
        trace: this.trace,
        attempts: this.attempts,
        log: this.log
      };

      localStorage.setItem(
        this.storageKey,
        JSON.stringify(state)
      );
    } catch {
      // The sequencer remains playable if storage is unavailable.
    }
  }

  private isSequencerState(state: unknown): state is SequencerState {
    return state === 'active' ||
      state === 'success' ||
      state === 'locked';
  }
}
