export interface ChatQuestionMessage {
  sessionId: string;
  question: string;
  lang: string;
}

export interface ChatResponseMessage {
  status_response: boolean;
  response: string | null | undefined;
  error: string | null | undefined;
}
