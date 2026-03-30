export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  role: Role;
  content?: string;
}

export interface ChatState  {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
}