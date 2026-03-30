export interface StreamChunkDto {
  content?: string; // Вариант (camelCase)
  Content?: string; // Вариант (PascalCase)
  error?: string;
  isComplete?: boolean;
}

export interface MessageSendRequest {
  SessionId?: string;
  Content?: string;
}

export interface TestStartRequest {
  TopicId: number;
  SessionId: string;
}