import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface LeakMessage {
  time: string;
  source: string;
  text: string;
}

@Component({
  selector: 'app-message-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-board.component.html',
  styleUrls: ['./message-board.component.scss']
})
export class MessageBoardComponent implements OnInit {

  messages = signal<LeakMessage[]>([]);

  ngOnInit() {
    this.startFeed();
  }

  startFeed() {

    const sources = [
      'ARASAKA//NODE-17',
      'MILITECH//SECNET',
      'UNKNOWN//LOCAL',
      'CORPMAIL//ENCRYPTED',
      'ICE-WATCH//LOG'
    ];

    const texts = [
      'access protocol breached',
      'unauthorized connection detected',
      'routing internal data stream',
      'user credential leak confirmed',
      'memory fragment recovered',
      'signal interference increasing',
      'ghost process detected in subnet',
      'data packet rerouted'
    ];

    setInterval(() => {

      const msg: LeakMessage = {
        time: new Date().toISOString().split('T')[1].slice(0, 8),
        source: sources[Math.floor(Math.random() * sources.length)],
        text: texts[Math.floor(Math.random() * texts.length)]
      };

      this.messages.update(m => [msg, ...m].slice(0, 80)); // keep feed alive

    }, 700);
  }
}