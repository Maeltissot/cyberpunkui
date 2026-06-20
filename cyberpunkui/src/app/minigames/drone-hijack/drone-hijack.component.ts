import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';

interface GridPoint {
  x: number;
  y: number;
}

interface DroneNode {
  id: string;
  name: string;
  type: string;
  position: GridPoint;
  range: number;
  heat: number;
}

type GameStatus = 'running' | 'won' | 'lost';

interface StoredDroneHijackState {
  selectedDroneId?: string;
  targetIndex?: number;
  alert?: number;
  taggedDroneIds?: string[];
  status?: GameStatus;
  message?: string;
}

@Component({
  selector: 'app-drone-hijack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drone-hijack.component.html',
  styleUrls: ['./drone-hijack.component.scss']
})
export class DroneHijackComponent implements OnInit, OnDestroy {

  private readonly storageKey = 'drone-hijack-state';

  readonly gridSize = 6;

  readonly drones: DroneNode[] = [
    {
      id: 'drone-a',
      name: 'D-04',
      type: 'ROOFTOP DRONE',
      position: { x: 1, y: 1 },
      range: 2,
      heat: 8
    },
    {
      id: 'cam-b',
      name: 'C-17',
      type: 'ALLEY CAMERA',
      position: { x: 4, y: 2 },
      range: 2,
      heat: 11
    },
    {
      id: 'drone-c',
      name: 'D-22',
      type: 'TRAFFIC DRONE',
      position: { x: 3, y: 5 },
      range: 2,
      heat: 14
    },
    {
      id: 'cam-d',
      name: 'C-09',
      type: 'LOBBY CAMERA',
      position: { x: 0, y: 2 },
      range: 2,
      heat: 10
    }
  ];

  readonly route: GridPoint[] = [
    { x: 0, y: 4 },
    { x: 1, y: 4 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
    { x: 4, y: 2 },
    { x: 5, y: 2 },
    { x: 5, y: 1 },
    { x: 4, y: 1 },
    { x: 3, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 3 }
  ];

  selectedDroneId = signal<string | null>(null);

  targetIndex = signal(0);

  alert = signal(18);

  taggedDroneIds = signal<string[]>([]);

  status = signal<GameStatus>('running');

  message = signal('TRACK THE COURIER WITHOUT TRIPPING CORPSEC');

  private tickId: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.loadState();

    if (this.status() === 'running') {
      this.start();
    }
  }

  ngOnDestroy() {
    this.stop();
  }

  get cells() {
    return Array.from(
      { length: this.gridSize * this.gridSize },
      (_, index) => ({
        x: index % this.gridSize,
        y: Math.floor(index / this.gridSize)
      })
    );
  }

  get selectedDrone() {
    return this.drones.find(drone =>
      drone.id === this.selectedDroneId()
    ) ?? null;
  }

  get target() {
    return this.route[this.targetIndex()];
  }

  get taggedCount() {
    return this.taggedDroneIds().length;
  }

  selectDrone(id: string) {
    if (this.status() !== 'running') {
      return;
    }

    this.selectedDroneId.set(id);
    this.raiseAlert(3);

    if (this.status() !== 'running') {
      this.saveState();
      return;
    }

    this.message.set('FEED SWITCHED. SIGNAL NOISE INCREASED.');
    this.saveState();
  }

  ping() {
    if (this.status() !== 'running') {
      return;
    }

    const drone =
      this.selectedDrone;

    if (!drone) {
      this.message.set('SELECT A SURVEILLANCE NODE BEFORE PINGING.');
      this.saveState();
      return;
    }

    this.raiseAlert(drone.heat);

    if (this.status() !== 'running') {
      this.saveState();
      return;
    }

    if (this.hasTaggedDrone(drone.id)) {
      this.message.set('THIS NODE ALREADY HOLDS A CLEAN TARGET TAG.');
      this.saveState();
      return;
    }

    if (this.isInRange(drone, this.target)) {
      this.taggedDroneIds.update(ids => [
        ...ids,
        drone.id
      ]);
      this.message.set(`${drone.name} TAG CONFIRMED. SWITCH NODES.`);

      if (this.taggedDroneIds().length >= this.drones.length) {
        this.status.set('won');
        this.message.set('COURIER ROUTE CAPTURED. DRONE HIJACK CLEAN.');
        this.stop();
      }

      this.saveState();
      return;
    }

    this.message.set('PING MISSED. TARGET OUTSIDE ACTIVE FEED.');
    this.saveState();
  }

  reset() {
    this.stop();
    this.selectedDroneId.set(null);
    this.targetIndex.set(0);
    this.alert.set(18);
    this.taggedDroneIds.set([]);
    this.status.set('running');
    this.message.set('TRACK THE COURIER WITHOUT TRIPPING CORPSEC');
    this.saveState();
    this.start();
  }

  hasTaggedDrone(id: string) {
    return this.taggedDroneIds().includes(id);
  }

  isTargetCell(cell: GridPoint) {
    return this.target.x === cell.x &&
      this.target.y === cell.y;
  }

  isDroneCell(cell: GridPoint, drone: DroneNode) {
    return drone.position.x === cell.x &&
      drone.position.y === cell.y;
  }

  isCoveredCell(cell: GridPoint) {
    const drone =
      this.selectedDrone;

    return !!drone &&
      this.isInRange(drone, cell);
  }

  private start() {
    this.tickId = setInterval(() => {
      if (this.status() !== 'running') {
        return;
      }

      this.targetIndex.update(index =>
        (index + 1) % this.route.length
      );

      this.saveState();
    }, 1500);
  }

  private stop() {
    if (!this.tickId) {
      return;
    }

    clearInterval(this.tickId);
    this.tickId = null;
  }

  private raiseAlert(amount: number) {
    this.alert.update(value =>
      Math.min(100, value + amount)
    );

    if (this.alert() >= 100) {
      this.status.set('lost');
      this.message.set('CORPSEC TRACE LOCKED. HIJACK BURNED.');
      this.stop();
    }
  }

  private loadState() {
    try {
      const raw =
        localStorage.getItem(this.storageKey);

      if (!raw) {
        return;
      }

      const state =
        JSON.parse(raw) as StoredDroneHijackState;

      if (
        typeof state.selectedDroneId === 'string' &&
        this.drones.some(drone => drone.id === state.selectedDroneId)
      ) {
        this.selectedDroneId.set(state.selectedDroneId);
      }

      if (typeof state.targetIndex === 'number') {
        this.targetIndex.set(
          Math.min(
            Math.max(Math.floor(state.targetIndex), 0),
            this.route.length - 1
          )
        );
      }

      if (typeof state.alert === 'number') {
        this.alert.set(
          Math.min(Math.max(Math.floor(state.alert), 0), 100)
        );
      }

      if (Array.isArray(state.taggedDroneIds)) {
        this.taggedDroneIds.set(
          state.taggedDroneIds.filter(id =>
            this.drones.some(drone => drone.id === id)
          )
        );
      }

      if (this.isGameStatus(state.status)) {
        this.status.set(state.status);
      }

      if (typeof state.message === 'string') {
        this.message.set(state.message);
      }
    } catch {
      // Ignore invalid saved data and start a fresh hijack.
    }
  }

  private saveState() {
    try {
      const state: StoredDroneHijackState = {
        selectedDroneId: this.selectedDroneId() ?? undefined,
        targetIndex: this.targetIndex(),
        alert: this.alert(),
        taggedDroneIds: this.taggedDroneIds(),
        status: this.status(),
        message: this.message()
      };

      localStorage.setItem(
        this.storageKey,
        JSON.stringify(state)
      );
    } catch {
      // Ignore storage failures so the minigame remains playable.
    }
  }

  private isGameStatus(
    status: unknown
  ): status is GameStatus {
    return status === 'running' ||
      status === 'won' ||
      status === 'lost';
  }

  private isInRange(
    drone: DroneNode,
    point: GridPoint
  ) {
    const distance =
      Math.abs(drone.position.x - point.x) +
      Math.abs(drone.position.y - point.y);

    return distance <= drone.range;
  }
}
