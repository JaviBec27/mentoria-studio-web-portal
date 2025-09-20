import { Component, signal, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppLayout } from '../../shared/components/layout/app-layout/app-layout';
import { AuthService } from '../../auth/services/auth.services';
import { HttpService } from '../../shared/services/http.service';
import { ChatQuestionMessage, ChatResponseMessage } from './chatmodel';
import { finalize } from 'rxjs';
import { parseJsonString } from '../../shared/operators/parse-json.operator';

interface Message {
  text: string;
  type: 'sent' | 'received';
}

@Component({
  selector: 'app-chat',
  imports: [AppLayout, ReactiveFormsModule, CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
  standalone: true,
})
export class Chat {
  private authService = inject(AuthService);
  private httpService = inject(HttpService);

  readonly sessionId: string = '';
  readonly language: string = 'es';
  readonly resourcepath: string = '/chat';

  messages = signal<Message[]>([
    { text: 'Hola, ¿en qué puedo ayudarte hoy?', type: 'received' },
  ]);
  messageControl = new FormControl('');
  isLoading = signal(false);

  constructor() {
    this.sessionId = this.authService.getSessionId();
  }

  sendMessage() {
    const question = this.messageControl.value;
    if (!question) {
      return;
    }

    // Add user's message to the chat
    this.messages.update((messages) => [...messages, { text: question, type: 'sent' }]);
    this.messageControl.setValue('');
    this.isLoading.set(true);

    // Prepare the message for the backend
    let chatQuestion: ChatQuestionMessage = {
      sessionId: this.sessionId,
      question: question,
      lang: this.language,
    };

    console.log('Sending chat question:', chatQuestion);

    // Call the HTTP service
    this.httpService.post<ChatResponseMessage>(this.resourcepath, chatQuestion)
      .pipe(
        parseJsonString<ChatResponseMessage>(),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (result) => {
          console.log('Received chat response:', result);
          let res = this.responseFormat(result);

          if (res.status_response === true && res.response) {
            this.messages.update((messages) => [
              ...messages,
              { text: res.response!, type: 'received' },
            ]);
          } else {
            const errorMessage = res.error || 'No se recibió una respuesta válida.';
            this.messages.update((messages) => [
              ...messages,
              { text: errorMessage, type: 'received' },
            ]);
          }
        },
        error: (err) => {
          console.error('Error sending message:', err);
          this.messages.update((messages) => [
            ...messages,
            { text: 'Error al conectar con el servidor. Por favor, intenta de nuevo.', type: 'received' },
          ]);
        }
      });
  }

  responseFormat(response: any): ChatResponseMessage {
    try {
      console.log("Raw response:", response);
      // 1. Intenta convertir el string a un objeto JavaScript/TypeScript.
      // Esto fallará si el string no es un JSON válido, y saltará al bloque "catch".
      const parsedJson = JSON.parse(response.body);
      console.log("Parsed JSON:", parsedJson);

      // 2. Crea el objeto de respuesta exitosa usando los datos del JSON.
      // Se asume que el JSON tiene la estructura esperada.
      const myresponse: ChatResponseMessage = {
        status_response: parsedJson.status_response,
        response: this.limpiarRespuesta(parsedJson.response),
        error: null, // No hay error, así que se establece como nulo.
      };

      return myresponse;

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

  limpiarRespuesta(texto: string): string {
    // Esta es la expresión regular que busca el patrón.
    const patronAEliminar = /(%\[[a-zA-Z0-9]+\]%)+/g;

    // Reemplaza todas las coincidencias del patrón con un string vacío "".
    return texto.replace(patronAEliminar, '');
  }


}
