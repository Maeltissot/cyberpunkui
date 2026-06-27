import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface NeuralChannel {
  id: string;
  name: string;
  value: number;
  target: number;
  tolerance: number;
  drift: number;
}

type CalibrationState = 'active' | 'success' | 'failed';

@Component({
  selector: 'app-implant-calibration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './implant-calibration.component.html',
  styleUrls: ['./implant-calibration.component.scss']
})
export class ImplantCalibrationComponent implements OnInit, OnDestroy {

  channels = signal<NeuralChannel[]>([
    {
      id: 'motor',
      name: 'MOTOR CORTEX',
      value: 18,
      target: 34,
      tolerance: 5,
      drift: 2
    },
    {
      id: 'optic',
      name: 'OPTIC BUS',
      value: 78,
      target: 63,
      tolerance: 6,
      drift: -3
    },
    {
      id: 'limbic',
      name: 'LIMBIC FILTER',
      value: 44,
      target: 51,
      tolerance: 4,
      drift: 4
    }
  ]);

  instability = signal(12);

  state = signal<CalibrationState>('active');

  message = signal('ALIGN NEURAL CHANNELS BEFORE THE WAVEFORM DESTABILIZES');

  private tickId: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.start();
  }

  ngOnDestroy() {
    this.stop();
  }

  updateChannel(
    id: string,
    rawValue: string
  ) {
    if (this.state() !== 'active') {
      return;
    }

    const value =
      Number(rawValue);

    this.channels.update(channels =>
      channels.map(channel =>
        channel.id === id
          ? {
            ...channel,
            value
          }
          : channel
      )
    );

    this.evaluate();
  }

  lockCalibration() {
    if (this.state() !== 'active') {
      return;
    }

    if (this.allChannelsAligned()) {
      this.state.set('success');
      this.message.set('NEURAL HANDSHAKE STABLE. IMPLANT CALIBRATION COMPLETE.');
      this.stop();
      return;
    }

    this.instability.update(value =>
      Math.min(100, value + 14)
    );
    this.message.set('LOCK REJECTED. CHANNEL ALIGNMENT OUTSIDE SAFE BAND.');
    this.evaluate();
  }

  reset() {
    this.stop();
    this.channels.set([
      {
        id: 'motor',
        name: 'MOTOR CORTEX',
        value: 18,
        target: 34,
        tolerance: 5,
        drift: 2
      },
      {
        id: 'optic',
        name: 'OPTIC BUS',
        value: 78,
        target: 63,
        tolerance: 6,
        drift: -3
      },
      {
        id: 'limbic',
        name: 'LIMBIC FILTER',
        value: 44,
        target: 51,
        tolerance: 4,
        drift: 4
      }
    ]);
    this.instability.set(12);
    this.state.set('active');
    this.message.set('ALIGN NEURAL CHANNELS BEFORE THE WAVEFORM DESTABILIZES');
    this.start();
  }

  isAligned(channel: NeuralChannel) {
    return Math.abs(channel.value - channel.target) <= channel.tolerance;
  }

  targetStart(channel: NeuralChannel) {
    return channel.target - channel.tolerance;
  }

  targetWidth(channel: NeuralChannel) {
    return channel.tolerance * 2;
  }

  private start() {
    this.tickId = setInterval(() => {
      if (this.state() !== 'active') {
        return;
      }

      this.channels.update(channels =>
        channels.map(channel => {
          const nextValue =
            channel.value + channel.drift;

          if (nextValue <= 0 || nextValue >= 100) {
            return {
              ...channel,
              value: Math.min(Math.max(nextValue, 0), 100),
              drift: channel.drift * -1
            };
          }

          return {
            ...channel,
            value: nextValue
          };
        })
      );

      this.instability.update(value =>
        Math.min(100, value + this.misalignedCount() * 2)
      );

      this.evaluate();
    }, 900);
  }

  private stop() {
    if (!this.tickId) {
      return;
    }

    clearInterval(this.tickId);
    this.tickId = null;
  }

  private evaluate() {
    if (this.allChannelsAligned()) {
      this.message.set('ALL CHANNELS WITHIN SAFE BAND. LOCK CALIBRATION.');
    }

    if (this.instability() >= 100) {
      this.state.set('failed');
      this.message.set('WAVEFORM COLLAPSED. IMPLANT REJECTED THE HANDSHAKE.');
      this.stop();
    }
  }

  private allChannelsAligned() {
    return this.channels()
      .every(channel => this.isAligned(channel));
  }

  private misalignedCount() {
    return this.channels()
      .filter(channel => !this.isAligned(channel))
      .length;
  }
}
