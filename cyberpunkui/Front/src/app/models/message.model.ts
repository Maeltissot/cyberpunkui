export interface EncryptedMessage {
  id: string;

  from: string;
  to: string;

  rawText: string;

  decryptedText?: string;

  state: 'locked' | 'partial' | 'decrypted';

  requiredKey?: string;   // needed to unlock
  noiseLevel?: number;    // corruption
}