import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-decrypt-puzzle',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './decrypt-puzzle.component.html',
    styleUrls: ['./decrypt-puzzle.component.scss']
})
export class DecryptPuzzleComponent implements OnInit {

    @Input() content = '';

    originalLines: string[] = [];
    scrambledLines: string[] = [];
    corruptedLines: string[] = [];
    selectedIndex: number | null = null;

    trace = 0;

    message = 'DECRYPT FILE';

    ngOnInit() {

        this.originalLines = this.content
            .trim()
            .split('\n')
            .map(l => l.trim());

        this.scrambledLines = [...this.originalLines]
            .sort(() => Math.random() - 0.5);

        this.corruptedLines = [...this.scrambledLines];

        this.startCorruptionLoop();
    }

    select(index: number) {

        if (this.selectedIndex === null) {
            this.selectedIndex = index;
            return;
        }

        // swap
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

    checkWin() {

        const success =
            this.originalLines.every(
                (line, i) => line === this.scrambledLines[i]
            );

        if (success) {
            this.message = 'DECRYPTION SUCCESSFUL';
        } else {
            this.trace += 5;
            // corruption spike
            if (Math.random() < 0.3) {
            this.trace += 10;
            }
        }
    }

    startCorruptionLoop() {
        document.body.classList.add('corruption-pulse');

        setTimeout(() => {
        document.body.classList.remove('corruption-pulse');
        }, 80);
        setInterval(() => {

            // don't corrupt after success
            if (this.message === 'DECRYPTION SUCCESSFUL') {
                return;
            }

            this.corruptedLines = this.scrambledLines.map(line =>
                this.corruptText(line)
            );

        }, 120);
    }


    corruptText(text: string): string {

        const chars = '!@#$%^&*<>[]{}▓▒░/\\\\|';

        return text
            .split('')
            .map(char => {

                // stronger corruption as trace increases
                const corruptionChance =
                    0.03 + (this.trace / 300);

                if (
                    char !== ' ' &&
                    Math.random() < corruptionChance
                ) {
                    return chars[
                        Math.floor(Math.random() * chars.length)
                    ];
                }

                return char;
            })
            .join('');
    }
}