import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppLayout } from '../../shared/components/layout/app-layout/app-layout';
import { WebSocketService } from '../../shared/services/websocket.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/services/auth.services';

interface Message {
  text: string;
  type: 'sent' | 'received';
}

interface ChatResponseMessage {
  status_response: boolean;
  response: string | null;
  error: string | null;
}

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
  private messageSubscription!: Subscription;

  /** ID de sesión del usuario */
  readonly sessionId: string = '';
  /** Lenguaje de la conversación */
  readonly language: string = 'es';
  /** Ruta del recurso en el backend */
  readonly resourcepath: string = '/chat';

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
        console.error('No se pudo obtener el token de acceso para WebSocket.');
        this.messages.update((messages) => [
          ...messages,
          { text: 'Error de autenticación. No se pudo conectar.', type: 'received' },
        ]);
      }
    } catch (error) {
      console.error('Error al obtener el token de acceso:', error);
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
        if (formattedResponse.status_response && formattedResponse.response) {
          this.messages.update((messages) => [
            ...messages,
            { text: formattedResponse.response as string, type: 'received' },
          ]);
        } else {
          const errorText = formattedResponse.error || 'Respuesta no válida del servidor.';
          this.messages.update((messages) => [
            ...messages,
            { text: errorText, type: 'received' },
          ]);
          console.error('Error en la respuesta:', formattedResponse.error);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error en la suscripción de mensajes WebSocket:', err);
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
      sessionId: this.sessionId,
      lang: this.language,
      question: question

    };

    this.webSocketService.sendMessage(payload);
  }

  /**
   * Formatea la respuesta del servicio HTTP.
   * @param response La respuesta recibida del servicio HTTP.
   * @returns Un objeto ChatResponseMessage con el estado y la respuesta formateada.
   */
  responseFormat(response: any): ChatResponseMessage {
    try {
      // 1. Intenta convertir el string a un objeto JavaScript/TypeScript.
      // Asumimos que el mensaje del WebSocket es un string JSON.
      const parsedJson = response;

      // 2. Crea el objeto de respuesta exitosa usando los datos del JSON.
      // Se asume que el JSON tiene la estructura esperada.
      const chatResponse: ChatResponseMessage = {
        status_response: parsedJson.status_response,
        response: this.limpiarRespuesta(parsedJson.response),
        error: null, // No hay error, así que se establece como nulo.
      };

      return chatResponse;

    } catch (error) {
      // 3. Si ocurre un error en el bloque "try" (ej. JSON mal formado),
      // se ejecuta este bloque.
      console.error("Error al procesar el JSON:", error);

      // 4. Crea y devuelve un objeto de error estandarizado.
      const errorResponse: ChatResponseMessage = {
        status_response: false,
        response: null,
        error: "El formato de la respuesta recibida es inválido.",
      };

      return errorResponse;
    }
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
