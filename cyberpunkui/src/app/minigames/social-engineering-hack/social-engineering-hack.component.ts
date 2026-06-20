import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

type HackState =
  | 'active'
  | 'success'
  | 'failed';

interface ChatLine {
  speaker: 'deck' | 'target' | 'system';
  text: string;
}

interface Choice {
  text: string;
  reply: string;
  trust: number;
  suspicion: number;
  credential?: boolean;
}

interface StoredSocialHackState {
  state?: HackState;
  stage?: number;
  trust?: number;
  suspicion?: number;
  credential?: string;
  lines?: ChatLine[];
}

@Component({
  selector: 'app-social-engineering-hack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-engineering-hack.component.html',
  styleUrls: ['./social-engineering-hack.component.scss']
})
export class SocialEngineeringHackComponent implements OnInit {

  readonly storageKey = 'social-engineering-hack-state';
  readonly target = 'MARTA VOSS // NIGHT SECURITY';
  readonly maxSuspicion = 100;
  readonly stages: Choice[][] = [
    [
      {
        text: 'Pose as building ops and mention a camera desync.',
        reply: 'Finally. Lobby cam has been ghosting all night.',
        trust: 24,
        suspicion: 6
      },
      {
        text: 'Demand immediate account verification.',
        reply: 'Who are you? Nobody opens like that.',
        trust: 0,
        suspicion: 50
      },
      {
        text: 'Open with a casual joke about night shift boredom.',
        reply: 'You get it. This place is dead after 02:00.',
        trust: 14,
        suspicion: 10
      }
    ],
    [
      {
        text: 'Ask them to confirm the maintenance phrase.',
        reply: 'Phrase? Uh... "blue rain on level six", right?',
        trust: 18,
        suspicion: 14
      },
      {
        text: 'Say the supervisor is auditing their response time.',
        reply: 'Great. Another audit. What do you need?',
        trust: 0,
        suspicion: 50
      },
      {
        text: 'Reference their lobby camera complaint and offer a patch.',
        reply: 'If that fixes the flicker, I am listening.',
        trust: 24,
        suspicion: 5
      }
    ],
    [
      {
        text: 'Request a one-time turret console token for diagnostics.',
        reply: 'Token sent. Make it quick before dispatch sees this.',
        trust: 28,
        suspicion: 18,
        credential: true
      },
      {
        text: 'Ask for their full password.',
        reply: 'Absolutely not. I am reporting this channel.',
        trust: 0,
        suspicion: 45
      },
      {
        text: 'Ask them to read the first six chars from their access badge.',
        reply: 'Badge reads NV-441A. Is that enough?',
        trust: 18,
        suspicion: 12,
        credential: true
      }
    ]
  ];

  state: HackState = 'active';
  stage = 0;
  trust = 20;
  suspicion = 0;
  credential = '';
  lines: ChatLine[] = [
    {
      speaker: 'system',
      text: 'VOICEPRINT MASK READY'
    },
    {
      speaker: 'target',
      text: 'Security desk. This better be important.'
    }
  ];

  ngOnInit() {
    this.loadState();
  }

  get choices(): Choice[] {
    return this.state === 'active'
      ? this.stages[this.stage]
      : [];
  }

  choose(choice: Choice) {
    if (this.state !== 'active') {
      return;
    }

    this.lines = [
      ...this.lines,
      {
        speaker: 'deck',
        text: choice.text
      },
      {
        speaker: 'target',
        text: choice.reply
      }
    ];

    this.trust = Math.min(100, this.trust + choice.trust);
    this.suspicion = Math.min(100, this.suspicion + choice.suspicion);

    if (this.suspicion >= this.maxSuspicion) {
      this.fail('TARGET TERMINATED CHANNEL');
      return;
    }

    if (choice.credential && this.trust >= 58) {
      this.credential = choice.text.includes('badge')
        ? 'BADGE SEED: NV-441A'
        : 'TURRET TOKEN: 7F-KITE-19';
      this.state = 'success';
      this.lines = [
        ...this.lines,
        {
          speaker: 'system',
          text: `${this.credential} CAPTURED`
        }
      ];
      this.saveState();
      return;
    }

    if (this.stage >= this.stages.length - 1) {
      this.fail('NO USABLE CREDENTIAL EXTRACTED');
      return;
    }

    this.stage++;
    this.saveState();
  }

  restart() {
    this.state = 'active';
    this.stage = 0;
    this.trust = 20;
    this.suspicion = 0;
    this.credential = '';
    this.lines = [
      {
        speaker: 'system',
        text: 'VOICEPRINT MASK READY'
      },
      {
        speaker: 'target',
        text: 'Security desk. This better be important.'
      }
    ];
    this.saveState();
  }

  private fail(reason: string) {
    this.state = 'failed';
    this.suspicion = this.maxSuspicion;
    this.lines = [
      ...this.lines,
      {
        speaker: 'target',
        text: 'The fuck do you think you are? Do you event know who you are hacking you piece of filth?! We will see you very soon netrunner.'
      },
      {
        speaker: 'system',
        text: reason
      },
      {
        speaker: 'system',
        text: 'ERROR: CHANNEL SEALED BY TARGET'
      }
    ];
    this.saveState();
  }

  private loadState() {
    try {
      const raw = localStorage.getItem(this.storageKey);

      if (!raw) {
        return;
      }

      const state = JSON.parse(raw) as StoredSocialHackState;

      if (this.isHackState(state.state)) {
        this.state = state.state;
      }

      if (typeof state.stage === 'number') {
        this.stage = Math.min(
          Math.max(state.stage, 0),
          this.stages.length - 1
        );
      }

      if (typeof state.trust === 'number') {
        this.trust = Math.min(Math.max(state.trust, 0), 100);
      }

      if (typeof state.suspicion === 'number') {
        this.suspicion = Math.min(Math.max(state.suspicion, 0), 100);
      }

      if (typeof state.credential === 'string') {
        this.credential = state.credential;
      }

      if (Array.isArray(state.lines)) {
        this.lines = state.lines;
      }
    } catch {
      this.restart();
    }
  }

  private saveState() {
    try {
      const state: StoredSocialHackState = {
        state: this.state,
        stage: this.stage,
        trust: this.trust,
        suspicion: this.suspicion,
        credential: this.credential,
        lines: this.lines
      };

      localStorage.setItem(
        this.storageKey,
        JSON.stringify(state)
      );
    } catch {
      // The chat hack remains playable if storage is unavailable.
    }
  }

  private isHackState(state: unknown): state is HackState {
    return state === 'active' ||
      state === 'success' ||
      state === 'failed';
  }
}
