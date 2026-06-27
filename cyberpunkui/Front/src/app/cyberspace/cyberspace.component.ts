import { Component } from '@angular/core';

@Component({
  selector: 'app-cyberspace',
  templateUrl: './cyberspace.component.html',
  styleUrls: ['./cyberspace.component.scss']
})
export class CyberspaceComponent {

  readonly fiberLines =
    Array.from({ length: 12 });

  readonly deckName =
    'MILITECH SHARDLINE X-9 CYBERDECK';

  readonly statusItems = [
    {
      label: 'Neural Bus',
      value: '96.4 Tb/s'
    },
    {
      label: 'ICE Parser',
      value: 'BLACKCLASS VII'
    },
    {
      label: 'Trace Mask',
      value: 'ACTIVE / 14 HOPS'
    },
    {
      label: 'Firmware',
      value: 'KERNEL 7.22.18-GHOST'
    },
    {
      label: 'Thermal State',
      value: '38 C / LIQUID LOOP'
    },
    {
      label: 'Signal Noise',
      value: '-82 dB'
    }
  ];

  readonly specs = [
    '12-slot daemon scheduler',
    'Quantum salt credential cache',
    'Tri-band shortwave intrusion modem',
    'Optic nerve latency compensator',
    'Hardware entropy lattice',
    'Memory scrubber with dead-drop restore',
    'Camera-bus RTSP spoof coprocessor',
    'Black ICE pre-impact signature scanner'
  ];
}
