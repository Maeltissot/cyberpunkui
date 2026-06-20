import {
    Component,
    effect,
    signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { GhostMessageService } from '../services/message.service';


@Component({
    selector: 'app-ghost-message',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ghost-message.component.html',
    styleUrls: ['./ghost-message.component.scss']
})
export class GhostMessageComponent {

    displayedText =
        signal('');

    constructor(
        public ghost:
        GhostMessageService
    ) {

        effect(() => {

            const msg =
                this.ghost.message();

            if (!msg) return;

            this.typeMessage(
                msg.text
            );
        });
    }

    async typeMessage(
        text: string
    ) {

        this.displayedText.set('');

        for (
            let i = 0;
            i < text.length;
            i++
        ) {

            this.displayedText.update(
                current =>
                    current +
                    text[i]
            );

            await new Promise(
                r =>
                    setTimeout(r, 25)
            );
        }
    }

    close() {

        this.ghost.close();
    }
}