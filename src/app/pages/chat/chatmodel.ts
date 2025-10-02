export interface ChatQuestionMessage {
  sessionId: string;
  question: string;
  lang: string;
  history: Interaction[];
}

export interface ChatResponseMessage {
  status_response: boolean;
  response: string | null | undefined;
  error: string | null | undefined;
}

export interface Message {
  text: string;
  type: 'sent' | 'received';
}

export interface Interaction {
  user: string;
  assistant: string;
}


/**
 * Representa el resultado del formateo de la respuesta del WebSocket.
 * Puede ser un mensaje de chat o nulo si el mensaje no es relevante para el chat.
 */
export type FormattedResponse = ChatResponseMessage | null;


/**
 * Interface para el mensaje de información de conexión.
 */
export interface ConnectionInfoMessage {
  message: string;
  connectionId: string;
  requestId: string;
}


/**
 * Type Guard para ChatResponseMessage.
 * Comprueba si el objeto tiene la propiedad 'status_response'.
 */
export function isChatResponseMessage(data: any): data is ChatResponseMessage {
  return data && typeof data.status_response === 'boolean';
}

/**
 * Type Guard para ConnectionInfoMessage.
 * Comprueba si el objeto tiene la propiedad 'connectionId'.
 */
export function isConnectionInfoMessage(data: any): data is ConnectionInfoMessage {
  return data && typeof data.connectionId === 'string';
}


