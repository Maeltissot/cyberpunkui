import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    Component,
    ElementRef,
    ViewChild,
    AfterViewChecked,
    AfterViewInit,
    Input,
    Output,
    EventEmitter,
    effect
} from '@angular/core';
import { CommandService } from '../services/command.service';
import { DisplayLoadingBarEvent, TextTerminalEvent } from '../Constants';

@Component({
    selector: 'app-terminal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './terminal.component.html',
    styleUrls: ['./terminal.component.scss']
})

export class TerminalComponent implements AfterViewInit {
    constructor(public commandService: CommandService) {
        this.commandService.events$
            .subscribe(event => {

                this.printQueue =
                    this.printQueue.then(async () => {

                        if (
                            event.type === TextTerminalEvent
                        ) {

                            await this.print(
                                event.payload,
                                event.displayTime
                            );
                        }

                        if (
                            event.type === DisplayLoadingBarEvent
                        ) {

                            await this.playLoadingBar(
                                event.payload
                            );
                        }

                    });

            });
    }
    private printQueue =
        Promise.resolve();
    @Input() fullscreen = false;

    @ViewChild('scrollContainer')
    scrollContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('inputEl')
    inputEl!: ElementRef<HTMLInputElement>;

    input = '';
    cursorPosition = 0;
    history: string[] = [
        'NEURAL TERMINAL v1.0',
        'CONNECTED TO CYBERDECK',
        'TYPE "help"'
    ];

    ngAfterViewInit() {
        this.focusInput();
    }
    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom() {
        try {
            this.scrollContainer.nativeElement.scrollTop =
                this.scrollContainer.nativeElement.scrollHeight;
        } catch { }
    }

    focusInput() {

        setTimeout(() => {
            this.inputEl?.nativeElement.focus();
        });
    }
    async execute(event: KeyboardEvent) {

        event.preventDefault();

        const raw =
            this.input.trim();

        if (!raw) return;

        await this.print(`> ${raw}`, 0);

        this.input = '';

        // SPLIT INPUT
        const parts =
            raw.split(' ');

        // COMMAND
        const commandName =
            parts[0].toLowerCase();

        // PARAMETERS
        const args =
            parts.slice(1);

        const command =
            this.commandService.commands[commandName];

        if (command) {

            await command(args);

        } else {

            await this.print(
                'UNKNOWN COMMAND', 0
            );
        }
    }

    async print(text: string, speed = 15) {

        // add empty line first
        this.history.push('');

        const lineIndex = this.history.length - 1;

        let current = '';

        if (speed === 0) {
            this.history.push(text);
        } else {
            for (const char of text) {

                current += char;

                this.history[lineIndex] = current;

                // force Angular update
                this.history = [...this.history];

                await this.delay(speed);
            }
        }
    }

    autoGrow(event: Event) {

        const el = event.target as HTMLTextAreaElement;

        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    }


    async playLoadingBar(label: string) {

        const frames = [
            '[▒▒▒▒▒▒▒▒▒▒]',
            '[██▒▒▒▒▒▒▒▒]',
            '[████▒▒▒▒▒▒]',
            '[██████▒▒▒▒]',
            '[████████▒▒]',
            '[██████████]'
        ];

        for (const frame of frames) {

            // replace last line
            this.history[this.history.length - 1] =
                `${label} ${frame}`;

            // trigger UI refresh
            this.history = [...this.history];

            await this.delay(180);
        }
    }
    delay(ms: number) {
        return new Promise(resolve =>
            setTimeout(resolve, ms)
        );
    }

}