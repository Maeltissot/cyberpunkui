import {
    AfterViewInit,
    Component,
    ElementRef,
    ViewChild,
    signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IntrusionService } from '../../services/intrusion.service';

@Component({
    selector: 'app-intrusion-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],
    templateUrl: './wordle-counterattack.component.html',
    styleUrls: ['./wordle-counterattack.component.scss']
})
export class WordleModalComponent implements AfterViewInit {

    @ViewChild('matrixCanvas')
    matrixCanvas!: ElementRef<HTMLCanvasElement>;

    @ViewChild('guessInput')
    guessInput!: ElementRef<HTMLInputElement>;

    guesses = signal<string[]>([]);

    successMode = signal(false);

    progress = signal(0);

    countermeasureLines = signal<string[]>([]);

    currentGuess = '';

    closing = signal(false);
    
    failMode = signal(false);

    failLines = signal<string[]>([]);

    redGlitch = signal(false);

    mode = signal<'play' | 'success' | 'fail'>('play');

    constructor(
        public intrusion: IntrusionService
    ) { }

    get guessPlaceholder(): string {

        const letterCount =
            this.intrusion.targetWord().length;

        return `ENTER ${letterCount} LETTER${letterCount === 1 ? '' : 'S'}`;
    }

    ngAfterViewInit(): void {

        this.startMatrix();

        setTimeout(() => {
            this.guessInput.nativeElement.focus();
        }, 200);
    }

    submit(): void {

        const guess =
            this.currentGuess
                .trim()
                .toUpperCase();

        const target =
            this.intrusion.targetWord()
                .toUpperCase();

        if (
            guess.length !==
            target.length
        ) {
            return;
        }

        this.guesses.update(
            g => [...g, guess]
        );

        if (guess === target) {

            this.launchCountermeasures();

            return;
        }

        this.intrusion.attempts.update(
            x => x - 1
        );

        if (
            this.intrusion.attempts() <= 0
        ) {

            this.launchFailureSequence();

            return;
        }

        this.currentGuess = '';

        setTimeout(() => {
            this.guessInput.nativeElement.focus();
        });
    }

    closeModal(success: boolean): void {

        this.closing.set(true);

        setTimeout(() => {

            if (success) {
                this.intrusion.success();
            } else {
                this.intrusion.fail();
            }

        }, 300);
    }

    getLetterState(
        letter: string,
        index: number,
        guess: string
    ): string {

        const target =
            this.intrusion.targetWord()
                .toUpperCase();

        if (
            target[index] === letter
        ) {
            return 'correct';
        }

        if (
            target.includes(letter)
        ) {
            return 'present';
        }

        return 'wrong';
    }

    private startMatrix(): void {

        const canvas =
            this.matrixCanvas.nativeElement;

        const ctx =
            canvas.getContext('2d');

        if (!ctx) return;

        canvas.width =
            window.innerWidth;

        canvas.height =
            window.innerHeight;

        const chars =
            '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&@';

        const fontSize = 18;

        const columns =
            Math.floor(
                canvas.width /
                fontSize
            );

        const drops =
            Array(columns).fill(1);

        setInterval(() => {

            ctx.fillStyle =
                'rgba(0,0,0,0.08)';

            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            ctx.fillStyle =
                '#00ff66';

            ctx.font =
                `${fontSize}px monospace`;

            for (
                let i = 0;
                i < drops.length;
                i++
            ) {

                const char =
                    chars[
                    Math.floor(
                        Math.random() *
                        chars.length
                    )
                    ];

                ctx.fillText(
                    char,
                    i * fontSize,
                    drops[i] * fontSize
                );

                if (
                    drops[i] *
                    fontSize >
                    canvas.height &&
                    Math.random() > 0.975
                ) {
                    drops[i] = 0;
                }

                drops[i]++;
            }

        }, 35);
    }

    private async launchCountermeasures() {

        this.mode.set('success');

        const lines = [

            'AUTHENTICATING NETRUNNER SIGNATURE',
            'ISOLATING ATTACK VECTOR',
            'SPOOFING TRACE ROUTE',
            'DEPLOYING COUNTER-ICE',
            'REROUTING NEURAL TRAFFIC',
            'PATCHING DATATUNNEL',
            'SEVERING HOSTILE CONNECTION',
            'VERIFYING ENCRYPTION HASH',
            'REBUILDING SECURITY INDEX',
            'CONNECTION STABILIZED'
        ];

        for (let i = 0; i < lines.length; i++) {

            this.countermeasureLines.update(
                current => [...current, lines[i]]
            );

            this.progress.set(
                Math.round(
                    ((i + 1) / lines.length) * 100
                )
            );

            await new Promise(
                r => setTimeout(r, 600)
            );
        }

        await new Promise(
            r => setTimeout(r, 1000)
        );

        this.closeModal(true);
    }

    private async launchFailureSequence() {

    this.mode.set('fail');
    this.redGlitch.set(true);

    const warnings = [

        'TRACE OVERRIDE FAILED',
        'INTRUSION VECTOR EXPOSED',
        'FIREWALL BREACH DETECTED',
        'NEURAL HANDSHAKE LOST',
        'ICE RESPONSE ACTIVATED',
        'HOST SYSTEM COMPROMISED',
        'BACKDOOR SEALED',
        'IDENTITY LEAKING',
        'SESSION HIJACKED',
        'USER TRACE LOCKED'
    ];

    // flood warnings fast
    for (let i = 0; i < warnings.length; i++) {

        this.failLines.update(
            x => [...x, warnings[i]]
        );

        await new Promise(
            r => setTimeout(r, 250)
        );
    }

    // final message delay
    await new Promise(
        r => setTimeout(r, 800)
    );

    this.failLines.update(
        x => [
            ...x,
            '>>> CONNECTION TERMINATED <<<',
            '>>> YOU HAVE BEEN TRACED <<<'
        ]
    );

    await new Promise(
        r => setTimeout(r, 1200)
    );

    this.closeModal(false);
}
}
