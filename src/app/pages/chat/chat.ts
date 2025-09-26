import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppLayout } from '@SharedLayout/app-layout/app-layout';
import { WebSocketService } from '@SharedServices/websocket.service';
import { Subscription } from 'rxjs';
import { AuthService } from '@AuthServices/auth.service';
import { Message, Interaction, ChatResponseMessage, isChatResponseMessage, isConnectionInfoMessage, FormattedResponse } from './chatmodel';
import { ConsoleLogService } from '@SharedServices/console-log.service';

/**
 * Componente principal para la funcionalidad de chat.
 * Gestiona la conexión WebSocket, el envío y recepción de mensajes,
 * y la visualización de la conversación en la interfaz de usuario.
 */
@Component({
  selector: 'app-chat',
  imports: [AppLayout, ReactiveFormsModule, CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
  standalone: true,
})
export class Chat implements OnInit, OnDestroy {
  private webSocketService = inject(WebSocketService);
  private authService = inject(AuthService);
  private logger = inject(ConsoleLogService);
  private messageSubscription!: Subscription;

  /** ID de sesión del usuario */
  readonly sessionId: string = '';
  /** Lenguaje de la conversación */
  readonly language: string = 'es';
  /** Ruta del recurso en el backend */
  readonly resourcepath: string = '/chat';

  /** Historial de las últimas 2 interacciones */
  interactionHistory = signal<Interaction[]>([]);

  /** Lista de mensajes en la conversación */
  messages = signal<Message[]>([
    { text: 'Hola, ¿en qué puedo ayudarte hoy?', type: 'received' },
  ]);

  /** Control del campo de entrada del mensaje */
  messageControl = new FormControl('');

  /** Indica si se está cargando una respuesta */
  isLoading = signal(false);

  /**
   * Constructor de la clase Chat.
   */
  constructor() {
    this.sessionId = this.authService.getSessionId();
  }

  async ngOnInit(): Promise<void> {
    // Obtiene el accessToken para la conexión.
    try {
      const token = await this.authService.getAccessToken();
      if (token) {
        // Inicia la conexión al WebSocket y se suscribe a los mensajes.
        this.webSocketService.connect(token).subscribe();
        this.subscribeToMessages();
      } else {
        this.logger.error('No se pudo obtener el token de acceso para WebSocket.');
        this.messages.update((messages) => [
          ...messages,
          { text: 'Error de autenticación. No se pudo conectar.', type: 'received' },
        ]);
      }
    } catch (error) {
      this.logger.error('Error al obtener el token de acceso:', error);
      this.messages.update((messages) => [
        ...messages,
        { text: 'Error de autenticación. No se pudo conectar.', type: 'received' },
      ]);
    }
  }

  ngOnDestroy(): void {
    // Limpia la suscripción y cierra la conexión para evitar fugas de memoria
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.webSocketService.close();
  }

  /**
   * Se suscribe a los mensajes entrantes del WebSocket y actualiza la interfaz.
   */
  private subscribeToMessages(): void {
    this.messageSubscription = this.webSocketService.messages$.subscribe({
      next: (message) => {
        const formattedResponse = this.responseFormat(message);

        // Solo procesa si es una respuesta de chat válida.
        if (formattedResponse) {
          if (formattedResponse.status_response && formattedResponse.response) {
            // 1. Encuentra la última pregunta del usuario ANTES de añadir la nueva respuesta.
            const lastUserMessage = this.messages().slice().reverse().find(m => m.type === 'sent');

            // 2. Añade el nuevo mensaje del asistente a la lista de mensajes.
            this.messages.update((messages) => [
              ...messages,
              { text: formattedResponse.response as string, type: 'received' },
            ]);

            // 3. Si se encontró una pregunta de usuario, actualiza el historial de interacciones.
            if (lastUserMessage) {
              this.updateInteractionHistory(lastUserMessage.text, formattedResponse.response as string);
            }
          } else {
            const errorText = formattedResponse.error || 'Respuesta no válida del servidor.';
            this.messages.update((messages) => [
              ...messages,
              { text: errorText, type: 'received' },
            ]);
            this.logger.error('Error en la respuesta:', formattedResponse.error);
          }
          this.isLoading.set(false);
        }
        // Si formattedResponse es null (ej. mensaje de conexión), no hace nada en la UI de chat.
      },
      error: (err) => {
        this.logger.error('Error en la suscripción de mensajes WebSocket:', err);
        this.messages.update((messages) => [
          ...messages,
          { text: 'Error de conexión con el servidor.', type: 'received' },
        ]);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Envía un mensaje al servidor y maneja la respuesta.
   * @returns
   */
  sendMessage(): void {
    const question = this.messageControl.value;
    if (!question) {
      return;
    }

    // Add user's message to the chat
    this.messages.update((messages) => [...messages, { text: question, type: 'sent' }]);
    this.messageControl.setValue('');
    this.isLoading.set(true);

    // Ajusta este payload al formato exacto que tu backend de WebSocket espera
    const payload = {
      action: 'sendMessage', // O la acción que tu backend espere, ej: 'message'
      data: {
        sessionId: this.sessionId,
        lang: this.language,
        question: question,
        history: this.interactionHistory()
      }
    };

    this.webSocketService.sendMessage(payload);
  }

  /**
   * Formatea la respuesta del servicio WebSocket usando type guards.
   * @param response La respuesta recibida del servicio WebSocket.
   * @returns Un objeto ChatResponseMessage, o null si el mensaje no es para el chat.
   */
  responseFormat(response: any): FormattedResponse {
    this.logger.log('Respuesta recibida:', response);

    if (isChatResponseMessage(response)) {
      // Es un mensaje de chat, lo procesamos.
      return {
        status_response: response.status_response,
        response: response.response ? this.limpiarRespuesta(response.response) : null,
        error: response.error,
      };
    }

    if (isConnectionInfoMessage(response)) {
      // Es un mensaje informativo de conexión, lo registramos y lo ignoramos para la UI.
      this.logger.log('Mensaje de conexión recibido:', response.message);
      return null;
    }

    // Si no es ninguno de los tipos conocidos, es un formato inesperado.
    this.logger.error("El formato de la respuesta recibida es inválido:", response);
    return {
      status_response: false,
      response: null,
      error: "El formato de la respuesta recibida es inválido.",
    };
  }

  /**
   * Actualiza el historial con la última interacción y lo mantiene con un máximo de 2 elementos.
   * @param userQuestion La pregunta del usuario.
   * @param assistantResponse La respuesta del asistente.
   */
  private updateInteractionHistory(userQuestion: string, assistantResponse: string): void {
    const newInteraction: Interaction = {
      user: userQuestion,
      assistant: assistantResponse,
    };

    this.interactionHistory.update(currentHistory => {
      const newHistory = [...currentHistory, newInteraction];
      // Mantiene solo las últimas 2 interacciones
      if (newHistory.length > 2) {
        return newHistory.slice(1);
      }
      return newHistory;
    });
    this.logger.log('Historial de interacciones actualizado:', this.interactionHistory());
  }

  /**
   * Limpia el texto de entrada eliminando patrones específicos.
   * @param texto El texto de entrada que puede contener patrones a eliminar.
   * @returns El texto limpio, sin los patrones especificados.
   */
  limpiarRespuesta(texto: string): string {
    // Esta es la expresión regular que busca el patrón.
    const patronAEliminar = /(%\[[a-zA-Z0-9]+\]%)+/g;

    // Reemplaza todas las coincidencias del patrón con un string vacío "".
    return texto.replace(patronAEliminar, '');
  }

}
