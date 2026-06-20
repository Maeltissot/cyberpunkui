import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, effect, signal } from '@angular/core';
import { ChatFile, ChatMessage } from '../models/chat.model';
import { MessageBoardService } from '../services/message.service';
import { GameStateService } from '../services/game-state.service';

@Component({
  selector: 'app-chat-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-board.component.html',
  styleUrls: ['./chat-board.component.scss']
})
export class ChatBoardComponent implements OnInit, OnDestroy {

  messages = signal<ChatMessage[]>([]);

  title = signal('// INTERCEPTED PRIVATE COMM LINK');

  leftParticipant = signal('');

  rightParticipant = signal('');

  openedFile = signal<ChatFile | null>(null);

  fileContent = signal('');

  breachProgress = signal(0);

  breachMessage = signal('');

  translatingIndex = signal<number | null>(null);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  private breachIntervalId: ReturnType<typeof setInterval> | null = null;

  private kickTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private translationTimeoutIds: ReturnType<typeof setTimeout>[] = [];

  private activeConversationIp: string | null = null;

  private lastTranslated = false;

  constructor(
    public board: MessageBoardService,
    private game: GameStateService
  ) {
    effect(() => {
      const conversation =
        this.board.activeConversation();

      if (!conversation) {
        return;
      }

      this.title.set(`// ${conversation.title}`);
      this.leftParticipant.set(conversation.leftParticipant);
      this.rightParticipant.set(conversation.rightParticipant);

      const sameConversation =
        this.activeConversationIp === conversation.ip;

      const translationStarted =
        sameConversation &&
        conversation.translated &&
        !this.lastTranslated;

      if (conversation.burned) {
        this.stopConversation();
        this.stopTranslation();
        this.messages.set([]);

        if (!this.breachMessage()) {
          this.openedFile.set(null);
          this.fileContent.set('');
          this.breachProgress.set(0);
        }

        return;
      }

      if (translationStarted) {
        this.animateTranslation(conversation.messages);
        this.lastTranslated = conversation.translated;
        return;
      }

      this.activeConversationIp = conversation.ip;
      this.lastTranslated = conversation.translated;
      this.openedFile.set(null);
      this.fileContent.set('');
      this.breachMessage.set('');
      this.breachProgress.set(0);

      this.startConversation(
        this.getDisplayMessages(
          conversation.messages,
          conversation.translated
        )
      );
    });
  }

  ngOnInit() {
    if (!this.board.activeConversation()) {
      this.board.openDefaultConversation();
    }
  }

  ngOnDestroy() {
    this.stopConversation();
    this.stopBreachSequence();
    this.stopTranslation();
  }

  openFile(file: ChatFile) {
    const conversation =
      this.board.activeConversation();

    if (!conversation || conversation.burned) {
      return;
    }

    this.openedFile.set(file);

    if (!file.spiked) {
      this.fileContent.set(file.content);
      this.breachMessage.set('');
      return;
    }

    this.fileContent.set(
      this.scramble(file.content)
    );

    this.board.burnActiveConversation();
    this.startBreachSequence();
  }

  startConversation(
    convo: Omit<ChatMessage, 'time'>[]
  ) {
    this.stopConversation();
    this.stopTranslation();
    this.messages.set([]);

    let i = 0;

    this.intervalId = setInterval(() => {

      if (i >= convo.length) {
        this.stopConversation();
        return;
      }

      const msg =
        convo[i];

      this.messages.update(m => [
        ...m,
        {
          ...msg,
          time: new Date().toISOString().split('T')[1].slice(0, 8)
        }
      ]);

      i++;

    }, 1200);
  }

  private stopConversation() {
    if (!this.intervalId) {
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  private animateTranslation(
    convo: Omit<ChatMessage, 'time'>[]
  ) {
    this.stopConversation();
    this.stopTranslation();

    const currentMessages =
      this.messages();

    const displayMessages =
      currentMessages.length === convo.length
        ? currentMessages
        : this.getDisplayMessages(convo, false).map(message => ({
          ...message,
          time: new Date().toISOString().split('T')[1].slice(0, 8)
        }));

    this.messages.set(displayMessages);

    const translatableIndexes =
      convo
        .map((message, index) => message.translatedText ? index : -1)
        .filter(index => index >= 0);

    if (translatableIndexes.length === 0) {
      return;
    }

    translatableIndexes.forEach((messageIndex, sequenceIndex) => {
      const startDelay =
        sequenceIndex * 950;

      this.translationTimeoutIds.push(
        setTimeout(() => {
          const source =
            convo[messageIndex].text;

          const target =
            convo[messageIndex].translatedText ?? source;

          this.decryptMessage(
            messageIndex,
            source,
            target
          );
        }, startDelay)
      );
    });
  }

  private decryptMessage(
    index: number,
    source: string,
    target: string
  ) {
    const steps = 14;
    const stepDuration = 70;

    this.translatingIndex.set(index);

    for (let step = 0; step <= steps; step++) {
      this.translationTimeoutIds.push(
        setTimeout(() => {
          const progress =
            step / steps;

          this.messages.update(messages =>
            messages.map((message, messageIndex) =>
              messageIndex === index
                ? {
                  ...message,
                  text: this.interpolateText(source, target, progress)
                }
                : message
            )
          );

          if (step === steps) {
            this.translatingIndex.set(null);
          }
        }, step * stepDuration)
      );
    }
  }

  private stopTranslation() {
    for (const timeoutId of this.translationTimeoutIds) {
      clearTimeout(timeoutId);
    }

    this.translationTimeoutIds = [];
    this.translatingIndex.set(null);
  }

  private getDisplayMessages(
    convo: Omit<ChatMessage, 'time'>[],
    translated: boolean
  ): Omit<ChatMessage, 'time'>[] {
    return convo.map(message => ({
      ...message,
      text: translated && message.translatedText
        ? message.translatedText
        : message.text
    }));
  }

  private interpolateText(
    source: string,
    target: string,
    progress: number
  ) {
    const length =
      Math.max(source.length, target.length);

    const translatedLength =
      Math.floor(length * progress);

    const chars =
      '01#%$@ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let text = '';

    for (let i = 0; i < length; i++) {
      if (i < translatedLength) {
        text += target[i] ?? '';
        continue;
      }

      const sourceChar =
        source[i] ?? target[i] ?? '';

      if (sourceChar === ' ') {
        text += ' ';
        continue;
      }

      text += chars[
        Math.floor(Math.random() * chars.length)
      ];
    }

    return text.trimEnd();
  }

  private startBreachSequence() {
    this.stopConversation();
    this.stopBreachSequence();
    this.breachProgress.set(0);
    this.breachMessage.set('FILE SPIKE TRIGGERED. CONVERSATION LINK COMPROMISED.');

    this.breachIntervalId = setInterval(() => {
      this.breachProgress.update(progress =>
        Math.min(progress + 12, 100)
      );
    }, 180);

    this.kickTimeoutId = setTimeout(() => {
      this.stopBreachSequence();
      this.game.setScene('cyberspace');
    }, 1900);
  }

  private stopBreachSequence() {
    if (this.breachIntervalId) {
      clearInterval(this.breachIntervalId);
      this.breachIntervalId = null;
    }

    if (this.kickTimeoutId) {
      clearTimeout(this.kickTimeoutId);
      this.kickTimeoutId = null;
    }
  }

  private scramble(text: string) {
    const chars =
      '01#%$@ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    return text
      .split('')
      .map(char => {
        if (char === ' ') {
          return ' ';
        }

        return chars[
          Math.floor(Math.random() * chars.length)
        ];
      })
      .join('');
  }
}
