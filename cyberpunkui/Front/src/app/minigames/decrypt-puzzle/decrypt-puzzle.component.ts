import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';

type DecryptView = 'puzzle' | 'success' | 'payload';

@Component({
    selector: 'app-decrypt-puzzle',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './decrypt-puzzle.component.html',
    styleUrls: ['./decrypt-puzzle.component.scss']
})
export class DecryptPuzzleComponent implements OnInit, OnDestroy {

    @Input() content = '';

    originalLines: string[] = [];
    scrambledLines: string[] = [];
    corruptedLines: string[] = [];
    selectedIndex: number | null = null;

    trace = 0;
    message = 'DECRYPT FILE';
    view: DecryptView = 'puzzle';

    private corruptionTimer?: ReturnType<typeof setInterval>;
    private pulseTimer?: ReturnType<typeof setTimeout>;
    private payloadTimer?: ReturnType<typeof setTimeout>;

    ngOnInit() {
        this.originalLines = this.content
            .trim()
            .split('\n')
            .map(line => line.trim());

        this.scrambledLines = [...this.originalLines]
            .sort(() => Math.random() - 0.5);

        this.corruptedLines = [...this.scrambledLines];
        this.startCorruptionLoop();
    }

    ngOnDestroy() {
        this.clearTimers();
        document.body.classList.remove('corruption-pulse');
    }

    select(index: number) {
        if (this.view !== 'puzzle') {
            return;
        }

        if (this.selectedIndex === null) {
            this.selectedIndex = index;
            return;
        }

        [
            this.scrambledLines[this.selectedIndex],
            this.scrambledLines[index]
        ] = [
            this.scrambledLines[index],
            this.scrambledLines[this.selectedIndex]
        ];

        this.selectedIndex = null;
        this.checkWin();
    }

    private checkWin() {
        const success = this.originalLines.every(
            (line, index) => line === this.scrambledLines[index]
        );

        if (success) {
            this.showSuccess();
            return;
        }

        this.trace += 5;

        if (Math.random() < 0.3) {
            this.trace += 10;
        }
    }

    private showSuccess() {
        this.message = 'DECRYPTION SUCCESSFUL';
        this.view = 'success';

        if (this.corruptionTimer) {
            clearInterval(this.corruptionTimer);
            this.corruptionTimer = undefined;
        }

        this.payloadTimer = setTimeout(() => {
            this.view = 'payload';
        }, 1800);
    }

    private startCorruptionLoop() {
        document.body.classList.add('corruption-pulse');

        this.pulseTimer = setTimeout(() => {
            document.body.classList.remove('corruption-pulse');
        }, 80);

        this.corruptionTimer = setInterval(() => {
            this.corruptedLines = this.scrambledLines.map(line =>
                this.corruptText(line)
            );
        }, 120);
    }

    private corruptText(text: string): string {
        const chars = '!@#$%^&*<>[]{}▓▒░/\\\\|';

        return text
            .split('')
            .map(char => {
                const corruptionChance = 0.03 + (this.trace / 3000);

                if (
                    char !== ' ' &&
                    Math.random() < corruptionChance
                ) {
                    return chars[Math.floor(Math.random() * chars.length)];
                }

                return char;
            })
            .join('');
    }

    private clearTimers() {
        if (this.corruptionTimer) {
            clearInterval(this.corruptionTimer);
        }

        if (this.pulseTimer) {
            clearTimeout(this.pulseTimer);
        }

        if (this.payloadTimer) {
            clearTimeout(this.payloadTimer);
        }
    }
}
