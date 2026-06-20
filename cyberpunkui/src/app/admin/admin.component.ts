import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IntrusionService } from '../services/intrusion.service';
import { GhostMessageService } from '../services/message.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  wordleWord = '';

  messageUser = '';

  messageText = '';

  status = '';

  constructor(
    private intrusion: IntrusionService,
    private ghostMessage: GhostMessageService
  ) { }

  launchWordle() {
    const word =
      this.wordleWord.trim();

    if (!word) {
      this.status = 'Enter a word before launching Wordle.';
      return;
    }

    this.intrusion.trigger(word);
    this.status = `Wordle launched with "${word.toUpperCase()}".`;
    this.wordleWord = '';
  }

  sendMessage() {
    const user =
      this.messageUser.trim();

    const message =
      this.messageText.trim();

    if (!user || !message) {
      this.status = 'Enter both a user and a message before sending.';
      return;
    }

    this.ghostMessage.show(user, message);
    this.status = `Message sent as ${user}.`;
    this.messageText = '';
  }
}
