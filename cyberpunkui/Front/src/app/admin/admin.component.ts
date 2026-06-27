import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiBaseUrl } from '../constants';

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
    private http: HttpClient
  ) { }

  launchWordle() {
    const word =
      this.wordleWord.trim();

    if (!word) {
      this.status = 'Enter a word before launching Wordle.';
      return;
    }

    this.http
      .post(`${ApiBaseUrl}/api/wordle`, { word })
      .subscribe({
        next: () => {
          this.status = `Wordle launched with "${word.toUpperCase()}".`;
          this.wordleWord = '';
        },
        error: () => {
          this.status = 'Unable to launch Wordle from the backend.';
        }
      });
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

    this.http
      .post(`${ApiBaseUrl}/api/message`, { user, message })
      .subscribe({
        next: () => {
          this.status = `Message sent as ${user}.`;
          this.messageText = '';
        },
        error: () => {
          this.status = 'Unable to send message from the backend.';
        }
      });
  }
}
