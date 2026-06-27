import { Injectable, signal } from '@angular/core';

export interface EncryptedMessage {
  id: string;
  from: string;
  orientation: string;
  to: string;
  rawText: string;
  decryptedText?: string;
  state: 'locked' | 'partial' | 'decrypted';
  requiredKey?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvestigationService {

  messages = signal<EncryptedMessage[]>([
    {
      id: '1',
      from: 'KIRISHI',
      orientation :"left",
      to: 'OPERATIVE',
      rawText: 'they are inside the system',
      state: 'locked',
      requiredKey: 'scanin'
    },
    {
      id: '2',
      orientation :"right",
      from: 'OPERATIVE',
      to: 'KIRISHI',
      rawText: 'terminate protocol 9',
      state: 'locked',
      requiredKey: 'decryptin'
    }
  ]);

  runCommand(cmd: string) {

    this.messages.update(msgs =>
      msgs.map(m => {

        if (m.requiredKey === cmd) {

          return {
            ...m,
            state: 'decrypted'
          };
        }

        return m;
      })
    );
  }
}