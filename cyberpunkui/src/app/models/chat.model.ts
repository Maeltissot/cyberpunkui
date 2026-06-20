export interface ChatFile {
  id: string;
  name: string;
  content: string;
  spiked?: boolean;
}

export interface ChatMessage {
  from: string;
  to: string;
  text: string;
  translatedText?: string;
  time: string;
  files?: ChatFile[];
}
